// // 'use strict';

// // module.exports = {
// //   async up(queryInterface, Sequelize) {

// //     // -------- Example: counseling_sessions.status --------
// //     // 1. Drop existing default
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status DROP DEFAULT;
// //     `);

// //     // 2. Convert column to TEXT temporarily
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status TYPE TEXT;
// //     `);

// //     // 3. Normalize existing data
// //     await queryInterface.sequelize.query(`
// //       UPDATE counseling_sessions
// //       SET status = LOWER(status);
// //     `);

// //     await queryInterface.sequelize.query(`
// //       UPDATE counseling_sessions
// //       SET status = 'requested'
// //       WHERE status NOT IN ('requested', 'confirmed', 'completed', 'cancelled');
// //     `);

// //     // 4. Create ENUM type safely
// //     await queryInterface.sequelize.query(`
// //       DO $$
// //       BEGIN
// //         CREATE TYPE enum_counseling_sessions_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
// //       EXCEPTION WHEN duplicate_object THEN NULL;
// //       END$$;
// //     `);

// //     // 5. Convert column to ENUM
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status TYPE enum_counseling_sessions_status
// //       USING status::enum_counseling_sessions_status;
// //     `);

// //     // 6. Set NOT NULL and default
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status SET NOT NULL;
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status SET DEFAULT 'requested';
// //     `);

// //     // -------- Repeat similar blocks for other ENUM columns --------
// //     // Example: library_content.content_type
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type DROP DEFAULT;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type TYPE TEXT;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       UPDATE library_content
// //       SET content_type = LOWER(content_type);
// //     `);

// //     await queryInterface.sequelize.query(`
// //       UPDATE library_content
// //       SET content_type = 'other'
// //       WHERE content_type NOT IN ('pdf', 'ebook', 'video', 'audio', 'other');
// //     `);

// //     await queryInterface.sequelize.query(`
// //       DO $$
// //       BEGIN
// //         CREATE TYPE enum_library_content_content_type AS ENUM ('pdf', 'ebook', 'video', 'audio', 'other');
// //       EXCEPTION WHEN duplicate_object THEN NULL;
// //       END$$;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type TYPE enum_library_content_content_type
// //       USING content_type::enum_library_content_content_type;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type SET NOT NULL;
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type SET DEFAULT 'other';
// //     `);

// //      // Add created_at and updated_at to questions table
// //     await queryInterface.addColumn('questions', 'created_at', {
// //       type: Sequelize.DATE,
// //       allowNull: false,
// //       defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
// //     });

    
    
// //     await queryInterface.addColumn('questions', 'updated_at', {
// //       type: Sequelize.DATE,
// //       allowNull: false,
// //       defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
// //     });
// //   },

// //   async down(queryInterface, Sequelize) {
// //     // Optional: revert ENUM columns to TEXT if needed
// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE counseling_sessions
// //       ALTER COLUMN status TYPE TEXT;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       ALTER TABLE library_content
// //       ALTER COLUMN content_type TYPE TEXT;
// //     `);

// //     // Optional: drop ENUM types
// //     await queryInterface.sequelize.query(`
// //       DROP TYPE IF EXISTS enum_counseling_sessions_status;
// //     `);

// //     await queryInterface.sequelize.query(`
// //       DROP TYPE IF EXISTS enum_library_content_content_type;
// //     `);

// //      await queryInterface.removeColumn('questions', 'created_at');
// //     await queryInterface.removeColumn('questions', 'updated_at');
// //   }
// // };




// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {

//     // -------- Example: counseling_sessions.status --------
//     // 1. Drop existing default
//     await queryInterface.sequelize.query(`
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status DROP DEFAULT;
//     `);

//     // 2. Convert column to TEXT temporarily
//     await queryInterface.sequelize.query(`
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status TYPE TEXT;
//     `);

//     // 3. Normalize existing data
//     await queryInterface.sequelize.query(`
//       UPDATE counseling_sessions
//       SET status = LOWER(status);
//     `);

//     await queryInterface.sequelize.query(`
//       UPDATE counseling_sessions
//       SET status = 'requested'
//       WHERE status NOT IN ('requested', 'confirmed', 'completed', 'cancelled');
//     `);

//     // 4. Create ENUM type safely
//     await queryInterface.sequelize.query(`
//       DO $$
//       BEGIN
//         CREATE TYPE enum_counseling_sessions_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
//       EXCEPTION WHEN duplicate_object THEN NULL;
//       END$$;
//     `);

//     // 5. Convert column to ENUM
//     await queryInterface.sequelize.query(`
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status TYPE enum_counseling_sessions_status
//       USING status::enum_counseling_sessions_status;
//     `);

//     // 6. Set NOT NULL and default
//     await queryInterface.sequelize.query(`
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status SET NOT NULL;
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status SET DEFAULT 'requested';
//     `);

//     // -------- Repeat similar blocks for other ENUM columns --------
//     // Example: library_content.content_type
//     await queryInterface.sequelize.query(`
//       ALTER TABLE library_content
//       ALTER COLUMN content_type DROP DEFAULT;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE library_content
//       ALTER COLUMN content_type TYPE TEXT;
//     `);

//     await queryInterface.sequelize.query(`
//       UPDATE library_content
//       SET content_type = LOWER(content_type);
//     `);

//     await queryInterface.sequelize.query(`
//       UPDATE library_content
//       SET content_type = 'other'
//       WHERE content_type NOT IN ('pdf', 'ebook', 'video', 'audio', 'other');
//     `);

//     await queryInterface.sequelize.query(`
//       DO $$
//       BEGIN
//         CREATE TYPE enum_library_content_content_type AS ENUM ('pdf', 'ebook', 'video', 'audio', 'other');
//       EXCEPTION WHEN duplicate_object THEN NULL;
//       END$$;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE library_content
//       ALTER COLUMN content_type TYPE enum_library_content_content_type
//       USING content_type::enum_library_content_content_type;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE library_content
//       ALTER COLUMN content_type SET NOT NULL;
//       ALTER TABLE library_content
//       ALTER COLUMN content_type SET DEFAULT 'other';
//     `);

//  // Add created_at
// await queryInterface.addColumn('questions', 'created_at', {
//   type: Sequelize.DATE,
//   allowNull: true, // Step 1: Start nullable
//   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
// });

// // Fill existing rows with a timestamp
// await queryInterface.sequelize.query(`
//   UPDATE questions SET created_at = NOW() WHERE created_at IS NULL;
// `);

// // Make the column NOT NULL
// await queryInterface.changeColumn('questions', 'created_at', {
//   type: Sequelize.DATE,
//   allowNull: false,
//   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
// });

// // Repeat the same for updated_at
// await queryInterface.addColumn('questions', 'updated_at', {
//   type: Sequelize.DATE,
//   allowNull: true,
//   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
// });

// await queryInterface.sequelize.query(`
//   UPDATE questions SET updated_at = NOW() WHERE updated_at IS NULL;
// `);

// await queryInterface.changeColumn('questions', 'updated_at', {
//   type: Sequelize.DATE,
//   allowNull: false,
//   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
// });

//   },

//   async down(queryInterface, Sequelize) {
//     // Optional: revert ENUM columns to TEXT if needed
//     await queryInterface.sequelize.query(`
//       ALTER TABLE counseling_sessions
//       ALTER COLUMN status TYPE TEXT;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE library_content
//       ALTER COLUMN content_type TYPE TEXT;
//     `);

//     // Optional: drop ENUM types
//     await queryInterface.sequelize.query(`
//       DROP TYPE IF EXISTS enum_counseling_sessions_status;
//     `);

//     await queryInterface.sequelize.query(`
//       DROP TYPE IF EXISTS enum_library_content_content_type;
//     `);

//      await queryInterface.removeColumn('questions', 'created_at');
//     await queryInterface.removeColumn('questions', 'updated_at');
//   }
// };

