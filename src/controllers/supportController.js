import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Generate unique ticket number
 */
const generateTicketNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `TKT-${year}${month}${day}-${random}`;
};

/**
 * Get user's support tickets
 */
export const getMyTickets = asyncHandler(async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.userId },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tickets });
  } catch (error) {
    // Fallback if relation doesn't exist yet - fetch comments separately
    if (error.message && error.message.includes('Unknown field')) {
      const tickets = await prisma.supportTicket.findMany({
        where: { userId: req.userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Fetch comments separately
      const ticketsWithComments = await Promise.all(
        tickets.map(async (ticket) => {
          const comments = await prisma.ticketComment.findMany({
            where: { ticketId: ticket.id },
            orderBy: { createdAt: 'asc' },
          });

          // Fetch user data for each comment
          const commentsWithUsers = await Promise.all(
            comments.map(async (comment) => {
              const user = await prisma.user.findUnique({
                where: { id: comment.userId },
                select: {
                  id: true,
                  email: true,
                  avatar: true,
                },
              });
              return { ...comment, user };
            })
          );

          return { ...ticket, comments: commentsWithUsers };
        })
      );

      res.json({ tickets: ticketsWithComments });
    } else {
      throw error;
    }
  }
});

/**
 * Get all tickets (Admin/Support)
 */
export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, category } = req.query;
  const where = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedTo) where.assignedTo = assignedTo;
  if (category) where.category = category;

  // Always use fallback method to avoid relation issues
  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch comments separately with user data
  const ticketsWithComments = await Promise.all(
    tickets.map(async (ticket) => {
      const comments = await prisma.ticketComment.findMany({
        where: { ticketId: ticket.id },
        orderBy: { createdAt: 'asc' },
      });

      // Fetch user data for each comment
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const user = await prisma.user.findUnique({
            where: { id: comment.userId },
            select: {
              id: true,
              email: true,
              avatar: true,
            },
          });
          return { ...comment, user };
        })
      );

      return { ...ticket, comments: commentsWithUsers };
    })
  );

  res.json({ tickets: ticketsWithComments });
});

/**
 * Get ticket by ID
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has access
    if (ticket.userId !== req.userId && !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    // Fallback if relation doesn't exist yet - fetch comments separately
    if (error.message && error.message.includes('Unknown field')) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if user has access
      if (ticket.userId !== req.userId && !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(req.userRole)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch comments separately
      const comments = await prisma.ticketComment.findMany({
        where: { ticketId: id },
        orderBy: { createdAt: 'asc' },
      });

      // Fetch user data for each comment
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const user = await prisma.user.findUnique({
            where: { id: comment.userId },
            select: {
              id: true,
              email: true,
              avatar: true,
            },
          });
          return { ...comment, user };
        })
      );

      res.json({ ticket: { ...ticket, comments: commentsWithUsers } });
    } else {
      throw error;
    }
  }
});

/**
 * Create support ticket
 */
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: generateTicketNumber(),
      userId: req.userId,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'MEDIUM',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Support ticket created successfully',
    ticket,
  });
});

/**
 * Update ticket
 */
export const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority, assignedTo, resolution } = req.body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Only admin/support can update status, priority, assignedTo
  const canUpdateAdminFields = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(req.userRole);
  
  const updateData = {};
  if (canUpdateAdminFields) {
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolution) updateData.resolution = resolution;
    if (status === 'RESOLVED' && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  res.json({
    message: 'Ticket updated successfully',
    ticket: updatedTicket,
  });
});

/**
 * Add comment to ticket
 */
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Check if user has access
  if (ticket.userId !== req.userId && !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Create comment
  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: id,
      userId: req.userId,
      comment: content, // Schema uses 'comment' field, not 'content'
    },
  });

  // Fetch user details separately to avoid relation issues
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      avatar: true,
    },
  });

  res.status(201).json({
    message: 'Comment added successfully',
    comment: {
      ...comment,
      user,
    },
  });
});

/**
 * Get ticket statistics
 */
export const getTicketStats = asyncHandler(async (req, res) => {
  const stats = await prisma.supportTicket.groupBy({
    by: ['status'],
    _count: true,
  });

  const priorityStats = await prisma.supportTicket.groupBy({
    by: ['priority'],
    _count: true,
  });

  res.json({
    byStatus: stats,
    byPriority: priorityStats,
    total: await prisma.supportTicket.count(),
  });
});

