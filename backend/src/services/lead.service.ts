import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateLeadInput, 
  UpdateLeadInput,
  LeadQueryInput,
  CreateFollowUpInput,
  ConvertLeadInput 
} from '../validation/lead.validation';

export class LeadService {
  /**
   * Create lead
   */
  async createLead(data: CreateLeadInput, createdBy: string) {
    const { name, email, phone, source, interest_level, preferred_membership, notes, branch_id, assigned_to } = data;

    // Verify branch exists
    const branch = await prisma.branches.findUnique({
      where: { id: branch_id }
    });

    if (!branch) {
      throw new ApiError('Branch not found', 404);
    }

    // Check if lead with same phone already exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM leads
      WHERE phone = ${phone} AND branch_id = ${branch_id}::uuid
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new ApiError('Lead with this phone number already exists for this branch', 400);
    }

    // Create lead
    const leadId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO leads (
        id, name, email, phone, source, status, interest_level,
        preferred_membership, notes, branch_id, assigned_to, created_by
      )
      VALUES (
        ${leadId}::uuid, ${name}, ${email || null}, ${phone}, ${source}, 'new', ${interest_level},
        ${preferred_membership || null}, ${notes || null}, ${branch_id}::uuid, 
        ${assigned_to || null}::uuid, ${createdBy}
      )
    `;

    return await this.getLeadById(leadId);
  }

  /**
   * Get leads with filters
   */
  async getLeads(query: LeadQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, status, interest_level, source, assigned_to, search, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];

    // Branch filtering
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      whereConditions.push(`l.branch_id = '${userBranchId}'::uuid`);
    } else if (branch_id) {
      whereConditions.push(`l.branch_id = '${branch_id}'::uuid`);
    }

    if (status) whereConditions.push(`l.status = '${status}'`);
    if (interest_level) whereConditions.push(`l.interest_level = '${interest_level}'`);
    if (source) whereConditions.push(`l.source = '${source}'`);
    if (assigned_to) whereConditions.push(`l.assigned_to = '${assigned_to}'::uuid`);

    if (search) {
      whereConditions.push(`(l.name ILIKE '%${search}%' OR l.email ILIKE '%${search}%' OR l.phone ILIKE '%${search}%')`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [leads, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          l.*,
          b.name as branch_name,
          p.full_name as assigned_to_name,
          EXTRACT(days FROM (NOW() - l.created_at))::int as days_old
        FROM leads l
        LEFT JOIN branches b ON l.branch_id = b.id
        LEFT JOIN profiles p ON l.assigned_to = p.user_id
        ${whereClause}
        ORDER BY 
          CASE l.interest_level 
            WHEN 'hot' THEN 1 
            WHEN 'warm' THEN 2 
            WHEN 'cold' THEN 3 
          END,
          l.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM leads l ${whereClause}
      `)
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string) {
    const lead = await prisma.$queryRaw<any[]>`
      SELECT 
        l.*,
        b.name as branch_name,
        p.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN branches b ON l.branch_id = b.id
      LEFT JOIN profiles p ON l.assigned_to = p.user_id
      WHERE l.id = ${id}::uuid
      LIMIT 1
    `;

    if (!lead || lead.length === 0) {
      throw new ApiError('Lead not found', 404);
    }

    return lead[0];
  }

  /**
   * Update lead
   */
  async updateLead(id: string, data: UpdateLeadInput) {
    await this.getLeadById(id);

    const updates: string[] = [];
    if (data.name) updates.push(`name = '${data.name}'`);
    if (data.email !== undefined) updates.push(`email = ${data.email ? `'${data.email}'` : 'NULL'}`);
    if (data.phone) updates.push(`phone = '${data.phone}'`);
    if (data.source) updates.push(`source = '${data.source}'`);
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.interest_level) updates.push(`interest_level = '${data.interest_level}'`);
    if (data.preferred_membership !== undefined) updates.push(`preferred_membership = ${data.preferred_membership ? `'${data.preferred_membership}'` : 'NULL'}`);
    if (data.notes !== undefined) updates.push(`notes = ${data.notes ? `'${data.notes}'` : 'NULL'}`);
    if (data.assigned_to !== undefined) updates.push(`assigned_to = ${data.assigned_to ? `'${data.assigned_to}'::uuid` : 'NULL'}`);
    updates.push(`updated_at = NOW()`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE leads 
        SET ${updates.join(', ')}
        WHERE id = '${id}'::uuid
      `);
    }

    return await this.getLeadById(id);
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string) {
    await this.getLeadById(id);

    await prisma.$executeRaw`
      DELETE FROM leads WHERE id = ${id}::uuid
    `;

    return { message: 'Lead deleted successfully' };
  }

  /**
   * Add follow-up note
   */
  async addFollowUp(data: CreateFollowUpInput, createdBy: string) {
    const { lead_id, notes, next_follow_up_date, contacted_via } = data;

    const lead = await this.getLeadById(lead_id);

    // Create follow-up note
    const followUpId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO lead_follow_ups (
        id, lead_id, notes, next_follow_up_date, contacted_via, created_by
      )
      VALUES (
        ${followUpId}::uuid, ${lead_id}::uuid, ${notes},
        ${next_follow_up_date ? new Date(next_follow_up_date) : null},
        ${contacted_via}, ${createdBy}
      )
    `;

    // Update lead status to contacted if new
    if (lead.status === 'new') {
      await prisma.$executeRaw`
        UPDATE leads
        SET status = 'contacted', updated_at = NOW()
        WHERE id = ${lead_id}::uuid
      `;
    }

    return { message: 'Follow-up added successfully', follow_up_id: followUpId };
  }

  /**
   * Convert lead to member
   */
  async convertLead(leadId: string, data: ConvertLeadInput, convertedBy: string) {
    const lead = await this.getLeadById(leadId);

    if (lead.status === 'converted') {
      throw new ApiError('Lead already converted', 400);
    }

    const { membership_plan_id, start_date, payment_method } = data;

    // Get membership plan
    const plan = await prisma.membership_plans.findUnique({
      where: { id: membership_plan_id }
    });

    if (!plan) {
      throw new ApiError('Membership plan not found', 404);
    }

    // Create member
    const memberId = crypto.randomUUID();
    const membershipStartDate = start_date ? new Date(start_date) : new Date();
    const membershipEndDate = new Date(membershipStartDate);
    membershipEndDate.setMonth(membershipEndDate.getMonth() + (plan.duration_months || 1));

    await prisma.members.create({
      data: {
        id: memberId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        branch_id: lead.branch_id,
        membership_plan_id,
        membership_start_date: membershipStartDate.toISOString(),
        membership_end_date: membershipEndDate.toISOString(),
        status: 'active',
        joining_date: new Date().toISOString()
      }
    });

    // Update lead status
    await prisma.$executeRaw`
      UPDATE leads
      SET 
        status = 'converted',
        converted_to_member_id = ${memberId}::uuid,
        converted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${leadId}::uuid
    `;

    return {
      message: 'Lead converted to member successfully',
      member_id: memberId,
      member_name: lead.name
    };
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(branchId?: string) {
    let whereClause = branchId ? `WHERE branch_id = '${branchId}'::uuid` : '';

    const stats = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'new')::int as new_leads,
        COUNT(*) FILTER (WHERE status = 'contacted')::int as contacted,
        COUNT(*) FILTER (WHERE status = 'qualified')::int as qualified,
        COUNT(*) FILTER (WHERE status = 'converted')::int as converted,
        COUNT(*) FILTER (WHERE status = 'lost')::int as lost,
        COUNT(*) FILTER (WHERE interest_level = 'hot')::int as hot_leads,
        (COUNT(*) FILTER (WHERE status = 'converted')::decimal / NULLIF(COUNT(*), 0) * 100)::decimal(5,2) as conversion_rate
      FROM leads
      ${whereClause}
    `);

    return stats[0];
  }
}

export const leadService = new LeadService();
