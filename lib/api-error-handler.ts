import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class APIError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export function handleAPIError(error: unknown, path?: string): NextResponse<ErrorResponse> {
  console.error(`API Error at ${path}:`, error);

  let statusCode = 500;
  let message = '服务器内部错误';
  let code: string | undefined;
  let details: any;

  if (error instanceof APIError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = '请求参数验证失败';
    code = 'VALIDATION_ERROR';
    details = error.errors;
  } else if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = '数据已存在';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = 404;
        message = '找不到相关数据';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = '外键约束失败';
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      default:
        message = '数据库操作失败';
        code = `PRISMA_${error.code}`;
    }
  } else if (error instanceof Error) {
    message = error.message;
    
    // Check for specific error messages
    if (message.includes('Unauthorized')) {
      statusCode = 401;
      code = 'UNAUTHORIZED';
    } else if (message.includes('Forbidden')) {
      statusCode = 403;
      code = 'FORBIDDEN';
    } else if (message.includes('Not found')) {
      statusCode = 404;
      code = 'NOT_FOUND';
    }
  }

  const response: ErrorResponse = {
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { details })
    },
    timestamp: new Date().toISOString(),
    path
  };

  return NextResponse.json(response, { status: statusCode });
}

// Async wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args[0] as Request;
      return handleAPIError(error, request.url);
    }
  }) as T;
}