import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Admin stats
router.get('/admin', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const [usersResult, agentsResult, banksResult, responsesResult, submittedResult, pendingResult] = await Promise.all([
      query("SELECT COUNT(*) FROM user_roles WHERE role = 'user'"),
      query("SELECT COUNT(*) FROM user_roles WHERE role = 'agent'"),
      query('SELECT COUNT(*) FROM banks'),
      query('SELECT COUNT(*) FROM form_responses'),
      query('SELECT COUNT(*) FROM form_responses WHERE is_submitted = true'),
      query('SELECT COUNT(*) FROM form_responses WHERE is_submitted = false'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalAgents: parseInt(agentsResult.rows[0].count),
        totalBanks: parseInt(banksResult.rows[0].count),
        totalResponses: parseInt(responsesResult.rows[0].count),
        submittedResponses: parseInt(submittedResult.rows[0].count),
        pendingResponses: parseInt(pendingResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Agent stats
router.get('/agent', authenticateToken, requireRole('agent'), async (req: Request, res: Response) => {
  try {
    const bankId = req.user!.bankId;

    if (!bankId) {
      return res.status(400).json({ success: false, message: 'Agent not assigned to any bank' });
    }

    const [responsesResult, submittedResult, pendingResult, usersResult] = await Promise.all([
      query('SELECT COUNT(*) FROM form_responses WHERE bank_id = $1', [bankId]),
      query('SELECT COUNT(*) FROM form_responses WHERE bank_id = $1 AND is_submitted = true', [bankId]),
      query('SELECT COUNT(*) FROM form_responses WHERE bank_id = $1 AND is_submitted = false', [bankId]),
      query('SELECT COUNT(DISTINCT user_id) FROM form_responses WHERE bank_id = $1', [bankId]),
    ]);

    res.json({
      success: true,
      data: {
        totalResponses: parseInt(responsesResult.rows[0].count),
        submittedResponses: parseInt(submittedResult.rows[0].count),
        pendingResponses: parseInt(pendingResult.rows[0].count),
        totalUsers: parseInt(usersResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
