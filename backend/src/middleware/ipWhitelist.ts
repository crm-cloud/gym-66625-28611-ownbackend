import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * IP Whitelisting middleware for admin endpoints
 */

// Load whitelisted IPs from environment variable
const WHITELISTED_IPS = process.env.ADMIN_WHITELIST_IPS?.split(',').map(ip => ip.trim()) || [];

// If no IPs are whitelisted, allow all (for development)
const IP_WHITELIST_ENABLED = process.env.ENABLE_IP_WHITELIST === 'true';

/**
 * Get client IP address from request
 */
function getClientIP(req: Request): string {
  // Check various headers for real IP (reverse proxy, load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (forwarded) {
    const ips = (forwarded as string).split(',');
    return ips[0].trim();
  }
  
  if (realIP) {
    return realIP as string;
  }
  
  return req.socket.remoteAddress || req.ip || 'unknown';
}

/**
 * Check if IP is in whitelist
 */
function isIPWhitelisted(ip: string): boolean {
  // Localhost is always allowed in development
  if (process.env.NODE_ENV === 'development') {
    const localhostIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
    if (localhostIPs.includes(ip)) {
      return true;
    }
  }

  // Check if IP is in whitelist
  return WHITELISTED_IPS.includes(ip);
}

/**
 * IP Whitelist middleware
 * Restricts access to admin endpoints based on IP address
 */
export function ipWhitelist(req: Request, res: Response, next: NextFunction) {
  // Skip if IP whitelisting is disabled
  if (!IP_WHITELIST_ENABLED) {
    return next();
  }

  // Skip if no whitelist is configured (allow all in this case)
  if (WHITELISTED_IPS.length === 0) {
    console.warn('IP whitelist enabled but no IPs configured. Allowing all requests.');
    return next();
  }

  const clientIP = getClientIP(req);

  // Log IP check attempt
  console.log(`IP whitelist check: ${clientIP} attempting to access ${req.path}`);

  if (!isIPWhitelisted(clientIP)) {
    console.warn(`Blocked request from non-whitelisted IP: ${clientIP}`);
    return next(new ApiError('Access denied: IP not whitelisted', 403));
  }

  next();
}

/**
 * Admin IP whitelist - stricter for admin operations
 */
export function adminIpWhitelist(req: Request, res: Response, next: NextFunction) {
  // Always enforce for super_admin operations
  if (!req.user || req.user.role !== 'super_admin') {
    return ipWhitelist(req, res, next);
  }

  // For super_admin, always check whitelist regardless of config
  const clientIP = getClientIP(req);
  
  // Development mode allows localhost
  if (process.env.NODE_ENV === 'development') {
    const localhostIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
    if (localhostIPs.includes(clientIP)) {
      return next();
    }
  }

  if (WHITELISTED_IPS.length === 0) {
    console.warn('No admin IPs whitelisted. Super admin access should be restricted!');
    return next();
  }

  if (!isIPWhitelisted(clientIP)) {
    console.error(`SECURITY: Blocked super_admin attempt from IP: ${clientIP}`);
    return next(new ApiError('Access denied: Admin IP not whitelisted', 403));
  }

  next();
}

/**
 * Get current IP whitelist status
 */
export function getWhitelistStatus() {
  return {
    enabled: IP_WHITELIST_ENABLED,
    count: WHITELISTED_IPS.length,
    ips: process.env.NODE_ENV === 'development' ? WHITELISTED_IPS : ['***hidden***'],
  };
}
