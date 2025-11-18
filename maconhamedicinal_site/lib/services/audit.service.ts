import { createServiceRoleClient } from '../supabase/server';
import type { AuditLog } from '@/types/database';

/**
 * Parameters for logging an audit event
 */
export interface AuditLogParams {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Service for managing audit logs
 * Tracks security-critical actions for compliance and debugging
 */
export class AuditService {
  /**
   * Logs an audit event to the database
   * 
   * @param params - The audit log parameters
   * @returns Promise resolving to the created audit log record
   * 
   * @example
   * ```typescript
   * const auditService = new AuditService();
   * await auditService.log({
   *   actorUserId: user.id,
   *   action: 'REGISTER',
   *   entityType: 'USER',
   *   entityId: user.id,
   *   ipAddress: req.ip,
   *   userAgent: req.headers['user-agent']
   * });
   * ```
   */
  async log(params: AuditLogParams): Promise<AuditLog> {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: params.actorUserId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create audit log:', error);
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return {
      id: data.id,
      actorUserId: data.actor_user_id,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      createdAt: data.created_at,
    };
  }
}
