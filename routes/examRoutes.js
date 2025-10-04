const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Add these missing routes
router.get('/:id/questions', auth, examController.getExamQuestions);
router.get('/:id/attempts', auth, examController.getExamAttempts);
router.get('/:id/results', auth, examController.getExamResults);

router.post(
  '/',
  auth,
  roleCheck(['teacher', 'admin']),
  examController.createExam
);

router.get('/', auth, examController.getExams);
router.get('/:id', auth, examController.getExamById);
router.put('/:id', auth, examController.updateExam);
router.delete('/:id', auth, examController.deleteExam);
router.post('/:id/publish', auth, examController.publishExam);
router.post('/:id/start', auth, examController.startExam);
router.post('/:id/submit', auth, examController.submitExam);
router.get('/create', auth, roleCheck(['teacher', 'admin']), (req, res) => {
  res.json({ message: 'Exam creation form' });
});
router.get('/:id/questions', auth, examController.getExamQuestions);
router.get('/:id/attempts', auth, examController.getExamAttempts);
router.get('/:id/results', auth, examController.getExamResults);


module.exports = router;