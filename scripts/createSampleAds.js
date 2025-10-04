// backend/scripts/createSampleAds.js
// Run this script to create sample advertisements: node scripts/createSampleAds.js

const db = require('../models');

const sampleAds = [
  {
    title: 'Master Data Science in 12 Weeks',
    description: 'Join our comprehensive Data Science bootcamp. Learn Python, Machine Learning, and AI from industry experts. Limited seats available!',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=200&fit=crop',
    link_url: 'https://example.com/data-science-course',
    ad_type: 'banner',
    target_audience: 'students',
    position: 'content_top',
    is_active: true,
    priority: 10,
    created_by: 1 // Change to your admin user ID
  },
  {
    title: '50% OFF All Study Materials',
    description: 'Get instant access to premium study guides, practice tests, and video tutorials. Use code: LEARN50',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop',
    link_url: 'https://example.com/study-materials',
    ad_type: 'sidebar',
    target_audience: 'all',
    position: 'sidebar_right',
    is_active: true,
    priority: 8,
    created_by: 1
  },
  {
    title: 'Professional Development for Educators',
    description: 'Enhance your teaching skills with our certified training program. Flexible schedule, online learning, and accredited certificates.',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=200&fit=crop',
    link_url: 'https://example.com/teacher-training',
    ad_type: 'banner',
    target_audience: 'teachers',
    position: 'content_top',
    is_active: true,
    priority: 9,
    created_by: 1
  },
  {
    title: 'Learn Anywhere with Our Mobile App',
    description: 'Download the EduLearn app and access all your courses on the go. Available on iOS and Android.',
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop',
    link_url: 'https://example.com/mobile-app',
    ad_type: 'sidebar',
    target_audience: 'all',
    position: 'sidebar_right',
    is_active: true,
    priority: 7,
    created_by: 1
  },
  {
    title: 'Track Your Child\'s Progress',
    description: 'Stay informed with real-time updates on your child\'s academic performance, attendance, and achievements.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
    link_url: 'https://example.com/parent-dashboard',
    ad_type: 'sidebar',
    target_audience: 'parents',
    position: 'sidebar_right',
    is_active: true,
    priority: 6,
    created_by: 1
  },
  {
    title: 'Ace Your Exams - Complete Prep Package',
    description: 'Everything you need to excel: 1000+ practice questions, mock tests, video solutions, and expert tips. Start your free trial today!',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=150&fit=crop',
    link_url: 'https://example.com/exam-prep',
    ad_type: 'banner',
    target_audience: 'students',
    position: 'content_bottom',
    is_active: true,
    priority: 5,
    created_by: 1
  },
  {
    title: 'Interactive Virtual Classroom',
    description: 'Engage students with whiteboard, screen sharing, breakout rooms, and real-time collaboration tools.',
    image_url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=300&h=200&fit=crop',
    link_url: 'https://example.com/virtual-classroom',
    ad_type: 'sidebar',
    target_audience: 'teachers',
    position: 'sidebar_right',
    is_active: true,
    priority: 6,
    created_by: 1
  },
  {
    title: 'Apply for Scholarships Now!',
    description: 'Thousands of scholarships available. Find the perfect match and get funding for your education. Free to apply!',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop',
    link_url: 'https://example.com/scholarships',
    ad_type: 'sidebar',
    target_audience: 'students',
    position: 'sidebar_left',
    is_active: true,
    priority: 8,
    created_by: 1
  },
  {
    title: 'Learn a New Language in 3 Months',
    description: 'Master English, Spanish, French, or Mandarin with AI-powered lessons. Personalized learning paths and native speaker practice.',
    image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=200&fit=crop',
    link_url: 'https://example.com/language-learning',
    ad_type: 'banner',
    target_audience: 'all',
    position: 'header',
    is_active: true,
    priority: 7,
    created_by: 1
  },
  {
    title: 'One-on-One Tutoring Available',
    description: 'Connect with expert tutors in Math, Science, Languages, and more. First session free. Book now!',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=200&fit=crop',
    link_url: 'https://example.com/tutoring',
    ad_type: 'sidebar',
    target_audience: 'students',
    position: 'sidebar_right',
    is_active: true,
    priority: 5,
    created_by: 1
  }
];

async function createSampleAds() {
  try {
    console.log('Creating sample advertisements...');
    
    // Check database connection
    await db.sequelize.authenticate();
    console.log('Database connected successfully');

    // Create advertisements
    for (const adData of sampleAds) {
      const ad = await db.Advertisement.create(adData);
      console.log(`✓ Created: ${ad.title}`);
    }

    console.log(`\n✅ Successfully created ${sampleAds.length} sample advertisements!`);
    console.log('\nYou can now:');
    console.log('1. View them at: http://localhost:3000/app/admin/advertisements');
    console.log('2. See them displayed on your dashboard and other pages');
    console.log('3. Edit or manage them through the admin panel');

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample ads:', error);
    process.exit(1);
  }
}

createSampleAds();