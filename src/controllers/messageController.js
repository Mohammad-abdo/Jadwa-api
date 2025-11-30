import prisma from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createNotification } from "../utils/notifications.js";

/**
 * Get user conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
  // Get user's client or consultant record
  let clientId = null;
  let consultantUserId = null;

  if (req.userRole === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });
    clientId = client?.id;
  } else if (req.userRole === "CONSULTANT") {
    consultantUserId = req.userId;
  } else if (["ADMIN", "SUPER_ADMIN"].includes(req.userRole)) {
    // Admins can see all conversations (both booking-based and direct)
    // Get all sessions without filtering by bookingId (includes both with and without booking)
    const sessions = await prisma.session.findMany({
      include: {
        booking: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
            consultant: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const conversations = sessions
      .map((session) => {
        const unreadCount = session.messages.filter(
          (m) => m.receiverId === req.userId && !m.isRead
        ).length;

        // Handle direct sessions (no booking)
        if (!session.booking) {
          // Get participants from messages
          const lastMessage = session.messages[0];
          if (lastMessage) {
            const otherUser =
              lastMessage.senderId === req.userId
                ? lastMessage.receiver
                : lastMessage.sender;
            return {
              id: session.id,
              sessionId: session.id,
              bookingId: null,
              name: otherUser?.email || "Unknown User",
              clientName: null,
              consultantName: null,
              clientId: otherUser?.id,
              consultantUserId: null,
              avatar: otherUser?.avatar,
              lastMessage: lastMessage?.content || "",
              lastMessageTime: lastMessage?.createdAt || session.createdAt,
              status: session.status,
              unreadCount,
              isDirect: true,
            };
          }
          return null;
        }

        // Handle booking-based sessions
        return {
          id: session.id,
          sessionId: session.id,
          bookingId: session.bookingId,
          name: `${session.booking.client.firstName} ${session.booking.client.lastName} - ${session.booking.consultant.firstName} ${session.booking.consultant.lastName}`,
          clientName: `${session.booking.client.firstName} ${session.booking.client.lastName}`,
          consultantName: `${session.booking.consultant.firstName} ${session.booking.consultant.lastName}`,
          clientId: session.booking.client.userId,
          consultantUserId: session.booking.consultant.userId,
          avatar: session.booking.client.user.avatar,
          lastMessage: session.messages[0]?.content || "",
          lastMessageTime: session.messages[0]?.createdAt || session.createdAt,
          status: session.status,
          unreadCount,
          isDirect: false,
        };
      })
      .filter(Boolean); // Remove null entries

    return res.json({ conversations });
  }

  // Get all sessions where user is involved (CLIENT or CONSULTANT)
  const sessions = await prisma.session.findMany({
    where: {
      booking: {
        OR: [
          ...(clientId ? [{ clientId }] : []),
          ...(consultantUserId
            ? [{ consultant: { userId: consultantUserId } }]
            : []),
        ],
      },
    },
    include: {
      booking: {
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          consultant: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const conversations = sessions.map((session) => {
    const isClient = session.booking.clientId === req.userId;
    const otherUser = isClient
      ? session.booking.consultant.user
      : session.booking.client.user;

    const unreadCount = session.messages.filter(
      (m) => m.receiverId === req.userId && !m.isRead
    ).length;

    return {
      id: session.id,
      sessionId: session.id,
      name: isClient
        ? `${session.booking.consultant.firstName} ${session.booking.consultant.lastName}`
        : `${session.booking.client.firstName} ${session.booking.client.lastName}`,
      avatar: otherUser.avatar,
      lastMessage: session.messages[0]?.content || "",
      lastMessageTime: session.messages[0]?.createdAt || session.createdAt,
      unreadCount,
    };
  });

  res.json({ conversations });
});

/**
 * Get messages for a session
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        include: {
          client: { include: { user: true } },
          consultant: { include: { user: true } },
        },
      },
    },
  });

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Check authorization - allow admins to view all messages
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.userRole);

  // For direct sessions (no booking), check if user is participant
  if (!session.booking) {
    // Check if user has any messages in this session
    const hasMessages = await prisma.message.findFirst({
      where: {
        sessionId,
        OR: [{ senderId: req.userId }, { receiverId: req.userId }],
      },
    });

    // If no messages yet, check if this is a new session by checking notifications
    if (!hasMessages && !isAdmin) {
      // For new direct sessions, check if there's a notification linking this user to this session
      const notification = await prisma.notification.findFirst({
        where: {
          userId: req.userId,
          OR: [
            { link: { contains: sessionId } },
            { link: { contains: `/chat/${sessionId}` } },
            { link: { contains: `/sessions/${sessionId}` } },
          ],
        },
      });

      // If no notification found and no messages, deny access
      // This prevents unauthorized access to direct sessions
      if (!notification) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
  } else {
    // For booking-based sessions
    // Check if booking has client and consultant relations
    if (session.booking?.client?.user && session.booking?.consultant?.user) {
      const isClient =
        req.userRole === "CLIENT" &&
        session.booking.client.user.id === req.userId;
      const isConsultant =
        req.userRole === "CONSULTANT" &&
        session.booking.consultant.user.id === req.userId;

      if (!isClient && !isConsultant && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      // Booking exists but relations are missing - check via messages
      const hasMessages = await prisma.message.findFirst({
        where: {
          sessionId,
          OR: [{ senderId: req.userId }, { receiverId: req.userId }],
        },
      });

      if (!hasMessages && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
  }

  const messages = await prisma.message.findMany({
    where: { sessionId },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json({ messages });
});

/**
 * Send message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const {
    content,
    messageType = "text",
    attachments,
    receiverId: providedReceiverId,
  } = req.body;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        include: {
          consultant: { include: { user: true } },
          client: { include: { user: true } },
        },
      },
    },
  });

  if (!session) {
    return res.status(404).json({
      error: "Session not found  from message controller send message",
    });
  }

  // Determine receiver
  let receiverId;

  // Handle direct sessions (no booking)
  if (!session.booking) {
    // If receiverId is provided in request, use it
    if (providedReceiverId) {
      receiverId = providedReceiverId;
    } else {
      // For direct sessions, find the other participant from previous messages
      const lastMessage = await prisma.message.findFirst({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      });

      if (lastMessage) {
        // Determine receiver based on last message
        // If we're sending as the last sender, receiver is the last receiver
        // Otherwise, receiver is the last sender
        receiverId =
          lastMessage.senderId === req.userId
            ? lastMessage.receiverId
            : lastMessage.senderId;
      } else {
        // No previous messages - try to find from notifications
        const notification = await prisma.notification.findFirst({
          where: {
            userId: req.userId,
            OR: [
              { link: { contains: sessionId } },
              { link: { contains: `/chat/${sessionId}` } },
              { link: { contains: `/sessions/${sessionId}` } },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        if (notification) {
          // Try to find the other user from the notification context
          // For now, we'll need receiverId to be provided for new direct sessions
          return res.status(400).json({
            error:
              "Cannot determine receiver for new direct session. Please provide receiverId in request body.",
          });
        } else {
          return res.status(400).json({
            error:
              "Cannot determine receiver for direct session. Please provide receiverId in request body.",
          });
        }
      }
    }
  } else {
    // Handle booking-based sessions
    if (req.userRole === "CLIENT") {
      receiverId = session.booking.consultant.userId;
    } else {
      // For consultant or other roles, receiver is the client's user ID
      receiverId = session.booking.client.userId;
    }
  }

  // Validate receiverId exists
  if (!receiverId) {
    return res.status(400).json({
      error:
        "Cannot determine receiver. Please provide receiverId in request body.",
    });
  }

  // Verify receiver user exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    return res.status(400).json({
      error: "Receiver user not found",
    });
  }

  const message = await prisma.message.create({
    data: {
      sessionId,
      senderId: req.userId,
      receiverId,
      content,
      messageType,
      attachments: attachments ? JSON.stringify(attachments) : null,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Notify receiver
  await createNotification({
    userId: receiverId,
    type: "CONSULTANT_RESPONSE",
    title: "New Message",
    message: `You have a new message from ${req.user.email}`,
    link: `/chat/${sessionId}`,
  });

  res.status(201).json({
    message: "Message sent successfully",
    message: message,
  });
});

/**
 * Send message as admin (can impersonate any user)
 */
export const sendMessageAsAdmin = asyncHandler(async (req, res) => {
  if (!["ADMIN", "SUPER_ADMIN"].includes(req.userRole)) {
    return res.status(403).json({ error: "Only admins can use this endpoint" });
  }

  const { sessionId } = req.params;
  const {
    content,
    messageType = "text",
    attachments,
    senderId,
    receiverId: providedReceiverId,
  } = req.body;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        include: {
          consultant: { include: { user: true } },
          client: { include: { user: true } },
        },
      },
    },
  });

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Use provided senderId or default to admin's userId
  const actualSenderId = senderId || req.userId;

  // Determine receiver (the other participant)
  let receiverId;

  // Handle direct sessions (no booking)
  if (!session.booking) {
    // If receiverId is provided in request, use it
    if (providedReceiverId) {
      receiverId = providedReceiverId;
    } else {
      // For direct sessions, find the other participant from previous messages
      const lastMessage = await prisma.message.findFirst({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      });

      if (lastMessage) {
        // Determine receiver based on last message
        // If we're sending as the last sender, receiver is the last receiver
        // Otherwise, receiver is the last sender
        receiverId =
          lastMessage.senderId === actualSenderId
            ? lastMessage.receiverId
            : lastMessage.senderId;
      } else {
        // No previous messages - find all participants from messages
        const allMessages = await prisma.message.findMany({
          where: { sessionId },
          select: {
            senderId: true,
            receiverId: true,
          },
        });

        // Collect all unique user IDs
        const allUserIds = new Set();
        allMessages.forEach((msg) => {
          allUserIds.add(msg.senderId);
          allUserIds.add(msg.receiverId);
        });

        // Remove the sender to get the receiver
        allUserIds.delete(actualSenderId);
        const otherUsers = Array.from(allUserIds);

        if (otherUsers.length > 0) {
          receiverId = otherUsers[0];
        } else {
          // No other participant found - require receiverId in request
          return res.status(400).json({
            error:
              "Cannot determine receiver for direct session. Please provide receiverId in request body.",
          });
        }
      }
    }
  } else {
    // Handle booking-based sessions
    const clientUserId = session.booking.client.userId;
    const consultantUserId = session.booking.consultant.userId;

    if (actualSenderId === clientUserId) {
      receiverId = consultantUserId;
    } else if (actualSenderId === consultantUserId) {
      receiverId = clientUserId;
    } else {
      // If sending as admin or other user, default to client as receiver
      receiverId = clientUserId;
    }
  }

  const message = await prisma.message.create({
    data: {
      sessionId,
      senderId: actualSenderId,
      receiverId,
      content,
      messageType,
      attachments: attachments ? JSON.stringify(attachments) : null,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Notify receiver
  await createNotification({
    userId: receiverId,
    type: "CONSULTANT_RESPONSE",
    title: "New Message",
    message: `You have a new message`,
    link: `/chat/${sessionId}`,
  });

  res.status(201).json({
    message: "Message sent successfully",
    message: message,
  });
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  await prisma.message.updateMany({
    where: {
      sessionId,
      receiverId: req.userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ message: "Messages marked as read" });
});
