# import sqlite3

# merged_db = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"

# conn = sqlite3.connect(merged_db)
# cursor = conn.cursor()

# # Step 1: Delete unwanted records
# cursor.execute(
#     """
#     DELETE FROM places
#     WHERE city_name IS NULL
# """
# )

# # Step 2: Reset IDs to be continuous
# cursor.execute("SELECT rowid, * FROM places ORDER BY id")
# rows = cursor.fetchall()
# id_index = [desc[0] for desc in cursor.description].index("id")

# for new_id, row in enumerate(rows, start=1):
#     rowid = row[0]
#     cursor.execute("UPDATE places SET id = ? WHERE rowid = ?", (new_id, rowid))

# conn.commit()
# print("Filtered and updated IDs in merged.db!")
# conn.close()

# # Run this once to add the column
# import sqlite3

# db_path = "C:/NguyenMinhTam/virtualr-main/backend/app/test7.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()
# cursor.execute("ALTER TABLE places ADD COLUMN place_detail JSON")
# conn.commit()
# conn.close()

# import sqlite3

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Add the city_name column if it doesn't exist
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN city_name TEXT")
# except sqlite3.OperationalError:
#     # Column already exists
#     pass

# # Update city_name based on integer part of latitude
# cursor.execute(
#     """
#     UPDATE places
#     SET city_name = 'HCMC, Vietnam'
#     WHERE CAST(json_extract(gps_coordinates, '$.latitude') AS INTEGER) = 10
# """
# )
# cursor.execute(
#     """
#     UPDATE places
#     SET city_name = 'Dalat, Vietnam'
#     WHERE CAST(json_extract(gps_coordinates, '$.latitude') AS INTEGER) = 11
# """
# )
# cursor.execute(
#     """
#     UPDATE places
#     SET city_name = 'Hue, Vietnam'
#     WHERE CAST(json_extract(gps_coordinates, '$.latitude') AS INTEGER) = 16
# """
# )

# conn.commit()
# conn.close()
# print("city_name column added and updated!")

# import sqlite3

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Step 1: Calculate the mean rating (M)
# cursor.execute("SELECT AVG(rating) FROM places WHERE rating IS NOT NULL")
# M = cursor.fetchone()[0] or 0

# # Step 2: Set the confidence constant (C)
# C = 200  # You can adjust this value

# # Step 3: Add POI_score column if it doesn't exist
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN POI_score REAL")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# # Step 4: Update POI_score for each place
# cursor.execute("SELECT id, rating, reviews FROM places")
# rows = cursor.fetchall()
# for id_, rating, reviews in rows:
#     if rating is not None and reviews is not None:
#         v = reviews
#         R = rating
#         score = (R * v + C * M) / (v + C)
#     else:
#         score = None
#     cursor.execute("UPDATE places SET POI_score = ? WHERE id = ?", (score, id_))

# conn.commit()
# conn.close()
# print("POI_score column updated using Bayesian average!")

# import sqlite3
# import json

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # 1. Create the type_stats table if it doesn't exist
# cursor.execute(
#     """
# CREATE TABLE IF NOT EXISTS type_stats (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     type_id TEXT,
#     city_name TEXT,
#     place_count INTEGER,
#     UNIQUE(type_id, city_name)
# )
# """
# )

# # 2. Clear existing stats (optional, if you want to refresh)
# cursor.execute("DELETE FROM type_stats")

# # 3. Read all places and accumulate counts
# cursor.execute("SELECT type_ids, city_name FROM places WHERE city_name IS NOT NULL")
# type_city_counts = {}

# for type_ids_json, city_name in cursor.fetchall():
#     if not type_ids_json or not city_name:
#         continue
#     try:
#         type_ids = json.loads(type_ids_json)
#     except Exception:
#         continue
#     for type_id in type_ids:
#         key = (type_id, city_name)
#         type_city_counts[key] = type_city_counts.get(key, 0) + 1

# # 4. Insert counts into type_stats
# for (type_id, city_name), count in type_city_counts.items():
#     cursor.execute(
#         "INSERT OR IGNORE INTO type_stats (type_id, city_name, place_count) VALUES (?, ?, ?)",
#         (type_id, city_name, count),
#     )
#     cursor.execute(
#         "UPDATE type_stats SET place_count = ? WHERE type_id = ? AND city_name = ?",
#         (count, type_id, city_name),
#     )

# conn.commit()
# conn.close()
# print("type_stats table created and populated!")

# import sqlite3
# import json

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Calculate global average POI_score
# cursor.execute("SELECT AVG(POI_score) FROM places WHERE POI_score IS NOT NULL")
# global_avg = cursor.fetchone()[0] or 0

# C = 20  # Confidence constant

# # Add type_score column if not exists
# try:
#     cursor.execute("ALTER TABLE type_stats ADD COLUMN type_score REAL")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# # Fetch all places once
# cursor.execute(
#     "SELECT POI_score, type_ids, city_name FROM places WHERE POI_score IS NOT NULL AND city_name IS NOT NULL AND type_ids IS NOT NULL"
# )
# all_places = cursor.fetchall()

# # Build a mapping: (type_id, city_name) -> list of POI_scores
# type_city_scores = {}
# for poi_score, type_ids_json, city_name in all_places:
#     try:
#         type_ids = json.loads(type_ids_json)
#     except Exception:
#         continue
#     for type_id in type_ids:
#         key = (type_id, city_name)
#         type_city_scores.setdefault(key, []).append(poi_score)

# # Calculate and update type_score for each type/city
# cursor.execute("SELECT type_id, city_name, place_count FROM type_stats")
# for type_id, city_name, place_count in cursor.fetchall():
#     scores = type_city_scores.get((type_id, city_name), [])
#     avg_score = sum(scores) / len(scores) if scores else 0
#     score = (
#         (avg_score * place_count + C * global_avg) / (place_count + C)
#         if place_count
#         else global_avg
#     )
#     cursor.execute(
#         "UPDATE type_stats SET type_score = ? WHERE type_id = ? AND city_name = ?",
#         (score, type_id, city_name),
#     )

# conn.commit()
# conn.close()
# print("type_score calculated and updated in type_stats!")

# import sqlite3

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Replace every en dash (–, U+2013) or em dash (—, U+2014) in price column with em dash (—)
# cursor.execute("SELECT id, price FROM places WHERE price IS NOT NULL")
# rows = cursor.fetchall()

# for id_, price in rows:
#     if price:
#         new_price = price.replace("\u2013", "\u2014").replace("\u2014", "\u2014")
#         if new_price != price:
#             cursor.execute("UPDATE places SET price = ? WHERE id = ?", (new_price, id_))

# conn.commit()
# conn.close()
# print("All en dashes and em dashes in price column replaced with em dash (—)!")

# import sqlite3

# # Paths to your databases
# src_db = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged4.db"  # Source DB (with place_detail)
# dst_db = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"  # Target DB (to update)

# # Connect to both databases
# src_conn = sqlite3.connect(src_db)
# dst_conn = sqlite3.connect(dst_db)
# src_cursor = src_conn.cursor()
# dst_cursor = dst_conn.cursor()

# # Fetch all id and place_detail from source
# src_cursor.execute(
#     "SELECT place_id, place_detail FROM places WHERE place_detail IS NOT NULL"
# )
# rows = src_cursor.fetchall()

# # Update target DB
# for place_id, place_detail in rows:
#     dst_cursor.execute(
#         "UPDATE places SET place_detail = ? WHERE place_id = ?",
#         (place_detail, place_id),
#     )

# dst_conn.commit()
# print(f"Copied {len(rows)} place_detail values to target database.")

# # Close connections
# src_conn.close()
# dst_conn.close()

# import sqlite3
# import json

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# json_path = "c:/NguyenMinhTam/IntelligentTourPlanner/backend/well_known_names.json"

# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# with open(json_path, "r", encoding="utf-8") as f:
#     names_data = json.load(f)

# for item in names_data:
#     name = item["name"]
#     en_json = json.dumps(item["en"], ensure_ascii=False)
#     vi_json = json.dumps(item["vi"], ensure_ascii=False)
#     # Update all places with matching name
#     cursor.execute(
#         "UPDATE places SET en_names = ?, vi_names = ? WHERE title = ?",
#         (en_json, vi_json, name),
#     )

# conn.commit()
# conn.close()
# print("Filled en_names and vi_names columns from JSON file!")

# import sqlite3

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Add columns for English and Vietnamese names (if not exist)
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN en_names JSON")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN vi_names JSON")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# conn.commit()
# conn.close()
# print("Added en_names and vi_names columns (if not exist)!")

# import sqlite3
# import json

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Drop the old FTS table if it exists
# cursor.execute("DROP TABLE IF EXISTS places_fts")

# # Create the new FTS5 table
# cursor.execute(
#     """
# CREATE VIRTUAL TABLE places_search USING fts5(
#     place_id,
#     title,
#     tokenize = 'unicode61 remove_diacritics 2'
#     )
# """
# )

# # Fetch all places
# cursor.execute("SELECT place_id, title, en_names, vi_names FROM places")
# rows = cursor.fetchall()

# inserted = 0
# for place_id, title, en_names_json, vi_names_json in rows:
#     names = set()
#     # Add the main title
#     if title:
#         names.add(title.strip())
#     # Add all English names
#     if en_names_json:
#         try:
#             en_names = json.loads(en_names_json)
#             if isinstance(en_names, list) and en_names:
#                 for n in en_names:
#                     if n and isinstance(n, str):
#                         names.add(n.strip())
#         except Exception:
#             pass
#     # Add all Vietnamese names
#     if vi_names_json:
#         try:
#             vi_names = json.loads(vi_names_json)
#             if isinstance(vi_names, list) and vi_names:  # Only if it's a non-empty list
#                 for n in vi_names:
#                     if n and isinstance(n, str):
#                         names.add(n.strip())
#         except Exception:
#             pass
#     # Insert each name as a row in the FTS table
#     for name in names:
#         cursor.execute(
#             "INSERT INTO places_search (place_id, title) VALUES (?, ?)",
#             (place_id, name),
#         )
#         inserted += 1

# conn.commit()
# conn.close()
# print(f"FTS5 table created and filled with {inserted} name entries!")

import sqlite3


def create_title_fts(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop the FTS table if it exists
    cursor.execute("DROP TABLE IF EXISTS types_search")

    # Create the FTS5 table with only one column
    cursor.execute(
        """
        CREATE VIRTUAL TABLE types_search USING fts5(
            type_id,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """
    )

    # Insert data from places.title
    cursor.execute(
        "INSERT INTO types_search (type_id) SELECT type_id FROM type_stats WHERE type_id IS NOT NULL"
    )

    conn.commit()
    conn.close()
    print("FTS5 table 'title_fts' created and filled with titles.")


# Usage:
create_title_fts("C:/NguyenMinhTam/test2/backend/app/merged.db")
