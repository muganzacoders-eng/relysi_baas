#!/usr/bin/env python3
"""
PostgreSQL Database Table Inspector
This script connects to a PostgreSQL database and retrieves all table structures
including columns, data types, constraints, and relationships.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
import sys

# Database connection parameters
DATABASE_URL = "postgres://direct_db_user:adminpaul@dpg-d2b6peidbo4c73aialbg-a.oregon-postgres.render.com:5432/direct_db"

def connect_to_database():
    """Establish connection to PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✓ Successfully connected to database")
        return conn
    except psycopg2.Error as e:
        print(f"✗ Error connecting to database: {e}")
        sys.exit(1)

def get_all_tables(cursor):
    """Get all table names from the database"""
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
    """
    cursor.execute(query)
    return [row['table_name'] for row in cursor.fetchall()]

def get_table_structure(cursor, table_name):
    """Get detailed structure information for a specific table"""
    query = """
    SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position,
        udt_name,
        numeric_precision,
        numeric_scale
    FROM information_schema.columns 
    WHERE table_name = %s 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
    """
    cursor.execute(query, (table_name,))
    return cursor.fetchall()

def get_table_constraints(cursor, table_name):
    """Get constraints for a specific table"""
    query = """
    SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.table_name = %s 
    AND tc.table_schema = 'public'
    ORDER BY tc.constraint_type, kcu.ordinal_position;
    """
    cursor.execute(query, (table_name,))
    return cursor.fetchall()

def get_table_indexes(cursor, table_name):
    """Get indexes for a specific table"""
    query = """
    SELECT 
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE tablename = %s 
    AND schemaname = 'public'
    ORDER BY indexname;
    """
    cursor.execute(query, (table_name,))
    return cursor.fetchall()

def get_table_row_count(cursor, table_name):
    """Get approximate row count for a table"""
    try:
        query = f"SELECT COUNT(*) as count FROM {table_name};"
        cursor.execute(query)
        result = cursor.fetchone()
        return result['count'] if result else 0
    except psycopg2.Error as e:
        return f"Error: {e}"

def format_column_info(column):
    """Format column information for display"""
    data_type = column['data_type']
    
    # Add length/precision info if available
    if column['character_maximum_length']:
        data_type += f"({column['character_maximum_length']})"
    elif column['numeric_precision'] and column['numeric_scale'] is not None:
        data_type += f"({column['numeric_precision']},{column['numeric_scale']})"
    elif column['numeric_precision']:
        data_type += f"({column['numeric_precision']})"
    
    nullable = "NULL" if column['is_nullable'] == 'YES' else "NOT NULL"
    default = f"DEFAULT {column['column_default']}" if column['column_default'] else ""
    
    return f"{column['column_name']:<30} {data_type:<20} {nullable:<10} {default}"

def main():
    """Main function to inspect database structure"""
    print("=" * 80)
    print("PostgreSQL Database Table Inspector")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Hidden'}")
    print("=" * 80)
    
    # Connect to database
    conn = connect_to_database()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get all tables
            tables = get_all_tables(cursor)
            
            if not tables:
                print("No tables found in the database.")
                return
            
            print(f"\nFound {len(tables)} tables:")
            for i, table in enumerate(tables, 1):
                print(f"{i}. {table}")
            
            print("\n" + "=" * 80)
            
            # Analyze each table
            database_structure = {}
            
            for table_name in tables:
                print(f"\nTABLE: {table_name}")
                print("-" * 60)
                
                # Get table structure
                columns = get_table_structure(cursor, table_name)
                constraints = get_table_constraints(cursor, table_name)
                indexes = get_table_indexes(cursor, table_name)
                row_count = get_table_row_count(cursor, table_name)
                
                # Store in dictionary for JSON export
                database_structure[table_name] = {
                    'columns': [dict(col) for col in columns],
                    'constraints': [dict(const) for const in constraints],
                    'indexes': [dict(idx) for idx in indexes],
                    'row_count': row_count
                }
                
                # Display columns
                print(f"Columns ({len(columns)}):")
                print(f"{'Name':<30} {'Type':<20} {'Nullable':<10} {'Default'}")
                print("-" * 75)
                
                for column in columns:
                    print(format_column_info(column))
                
                # Display constraints
                if constraints:
                    print(f"\nConstraints ({len(constraints)}):")
                    constraint_groups = {}
                    for constraint in constraints:
                        const_type = constraint['constraint_type']
                        if const_type not in constraint_groups:
                            constraint_groups[const_type] = []
                        constraint_groups[const_type].append(constraint)
                    
                    for const_type, const_list in constraint_groups.items():
                        print(f"  {const_type}:")
                        for constraint in const_list:
                            if constraint['foreign_table_name']:
                                print(f"    - {constraint['column_name']} → {constraint['foreign_table_name']}.{constraint['foreign_column_name']}")
                            else:
                                print(f"    - {constraint['column_name']} ({constraint['constraint_name']})")
                
                # Display indexes
                if indexes:
                    print(f"\nIndexes ({len(indexes)}):")
                    for index in indexes:
                        print(f"  - {index['indexname']}")
                
                # Display row count
                print(f"\nRow Count: {row_count}")
                
                print("\n" + "=" * 80)
            
            # Save to JSON file
            output_file = f"database_structure_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(output_file, 'w') as f:
                json.dump(database_structure, f, indent=2, default=str)
            
            print(f"\n✓ Database structure saved to: {output_file}")
            
            # Generate summary
            print(f"\nDATABASE SUMMARY:")
            print(f"Total tables: {len(tables)}")
            total_columns = sum(len(structure['columns']) for structure in database_structure.values())
            print(f"Total columns: {total_columns}")
            total_rows = sum(structure['row_count'] for structure in database_structure.values() if isinstance(structure['row_count'], int))
            print(f"Total rows: {total_rows}")
            
    except psycopg2.Error as e:
        print(f"✗ Database error: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    finally:
        conn.close()
        print("\n✓ Database connection closed")

if __name__ == "__main__":
    # Check if psycopg2 is available
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except ImportError:
        print("Error: psycopg2 is not installed.")
        print("Install it using: pip install psycopg2-binary")
        sys.exit(1)
    
    main()