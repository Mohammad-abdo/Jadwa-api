# Fix Prisma Generate EPERM Error

## Problem
When running `npx prisma generate`, you may encounter:
```
Error: EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...' -> '...query_engine-windows.dll.node'
```

## Solution

### Option 1: Stop the Server First (Recommended)
1. Stop your backend server (if running)
2. Close any processes that might be using Prisma (VS Code, other terminals)
3. Run: `npx prisma generate`

### Option 2: Run as Administrator
1. Right-click on PowerShell/Command Prompt
2. Select "Run as Administrator"
3. Navigate to backend folder
4. Run: `npx prisma generate`

### Option 3: Delete and Regenerate
1. Stop the server
2. Delete `node_modules/.prisma` folder
3. Run: `npx prisma generate`

### Option 4: Use Prisma Studio to Check
If generation fails, you can still use:
```bash
npx prisma studio
```

## After Generation
Once `prisma generate` succeeds, restart your backend server:
```bash
npm run dev
```

