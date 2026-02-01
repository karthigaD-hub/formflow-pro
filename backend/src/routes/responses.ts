import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get responses (filtered by role)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { bankId, sectionId, userId, isSubmitted } = req.query;
    const user = req.user!;

    let sql = `
      SELECT fr.*, 
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             s.title as section_title, s.description as section_description,
             b.name as bank_name, b.logo as bank_logo
      FROM form_responses fr
      JOIN users u ON fr.user_id = u.id
      JOIN sections s ON fr.section_id = s.id
      JOIN banks b ON fr.bank_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (user.role === 'user') {
      sql += ` AND fr.user_id = $${paramIndex++}`;
      params.push(user.userId);
    } else if (user.role === 'agent') {
      sql += ` AND fr.bank_id = $${paramIndex++}`;
      params.push(user.bankId);
    }
    // Admin can see all

    // Additional filters
    if (bankId) {
      sql += ` AND fr.bank_id = $${paramIndex++}`;
      params.push(bankId);
    }
    if (sectionId) {
      sql += ` AND fr.section_id = $${paramIndex++}`;
      params.push(sectionId);
    }
    if (userId) {
      sql += ` AND fr.user_id = $${paramIndex++}`;
      params.push(userId);
    }
    if (isSubmitted !== undefined) {
      sql += ` AND fr.is_submitted = $${paramIndex++}`;
      params.push(isSubmitted === 'true');
    }

    sql += ' ORDER BY fr.updated_at DESC';

    const result = await query(sql, params);

    const responses = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      user: {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email,
        phone: r.user_phone,
      },
      sectionId: r.section_id,
      section: {
        id: r.section_id,
        title: r.section_title,
        description: r.section_description,
      },
      bankId: r.bank_id,
      bank: {
        id: r.bank_id,
        name: r.bank_name,
        logo: r.bank_logo,
      },
      responses: r.responses,
      isSubmitted: r.is_submitted,
      submittedAt: r.submitted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single response
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    let sql = `
      SELECT fr.*, 
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             s.title as section_title, s.description as section_description,
             b.name as bank_name, b.logo as bank_logo
      FROM form_responses fr
      JOIN users u ON fr.user_id = u.id
      JOIN sections s ON fr.section_id = s.id
      JOIN banks b ON fr.bank_id = b.id
      WHERE fr.id = $1
    `;
    const params: any[] = [id];

    // Role-based access
    if (user.role === 'user') {
      sql += ' AND fr.user_id = $2';
      params.push(user.userId);
    } else if (user.role === 'agent') {
      sql += ' AND fr.bank_id = $2';
      params.push(user.bankId);
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        user: { id: r.user_id, name: r.user_name, email: r.user_email, phone: r.user_phone },
        sectionId: r.section_id,
        section: { id: r.section_id, title: r.section_title, description: r.section_description },
        bankId: r.bank_id,
        bank: { id: r.bank_id, name: r.bank_name, logo: r.bank_logo },
        responses: r.responses,
        isSubmitted: r.is_submitted,
        submittedAt: r.submitted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's response for a section
router.get('/user/section/:sectionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user!.userId;

    const result = await query(
      'SELECT * FROM form_responses WHERE user_id = $1 AND section_id = $2',
      [userId, sectionId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        sectionId: r.section_id,
        bankId: r.bank_id,
        responses: r.responses,
        isSubmitted: r.is_submitted,
        submittedAt: r.submitted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error('Get user response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save/update response (auto-save)
router.post('/save', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sectionId, bankId, responses } = req.body;
    const userId = req.user!.userId;

    if (!sectionId || !bankId || !responses) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if response exists
    const existing = await query(
      'SELECT id FROM form_responses WHERE user_id = $1 AND section_id = $2',
      [userId, sectionId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE form_responses 
         SET responses = $1, updated_at = NOW()
         WHERE user_id = $2 AND section_id = $3
         RETURNING *`,
        [JSON.stringify(responses), userId, sectionId]
      );
    } else {
      // Create new
      result = await query(
        `INSERT INTO form_responses (user_id, section_id, bank_id, responses)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, sectionId, bankId, JSON.stringify(responses)]
      );
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        sectionId: r.section_id,
        bankId: r.bank_id,
        responses: r.responses,
        isSubmitted: r.is_submitted,
        submittedAt: r.submitted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error('Save response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit response
router.post('/:id/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await query(
      `UPDATE form_responses 
       SET is_submitted = true, submitted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        sectionId: r.section_id,
        bankId: r.bank_id,
        responses: r.responses,
        isSubmitted: r.is_submitted,
        submittedAt: r.submitted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
