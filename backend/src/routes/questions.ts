import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Update question (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, label, placeholder, required, options, order } = req.body;

    const result = await query(
      `UPDATE questions 
       SET type = COALESCE($1, type),
           label = COALESCE($2, label),
           placeholder = COALESCE($3, placeholder),
           required = COALESCE($4, required),
           options = COALESCE($5, options),
           "order" = COALESCE($6, "order")
       WHERE id = $7 
       RETURNING *`,
      [type, label, placeholder, required, options ? JSON.stringify(options) : null, order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const question = result.rows[0];
    res.json({
      success: true,
      data: {
        id: question.id,
        sectionId: question.section_id,
        type: question.type,
        label: question.label,
        placeholder: question.placeholder,
        required: question.required,
        options: question.options,
        order: question.order,
        createdAt: question.created_at,
      },
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete question (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
