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

# # import sqlite3
# # import json

# # db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"
# # conn = sqlite3.connect(db_path)
# # cursor = conn.cursor()

# # # 1. Create the type_stats table if it doesn't exist
# # cursor.execute(
# #     """
# # CREATE TABLE IF NOT EXISTS type_stats (
# #     id INTEGER PRIMARY KEY AUTOINCREMENT,
# #     type_id TEXT,
# #     city_name TEXT,
# #     place_count INTEGER,
# #     UNIQUE(type_id, city_name)
# # )
# # """
# # )

# # # 2. Clear existing stats (optional, if you want to refresh)
# # cursor.execute("DELETE FROM type_stats")

# # # 3. Read all places and accumulate counts
# # cursor.execute("SELECT type_ids, city_name FROM places WHERE city_name IS NOT NULL")
# # type_city_counts = {}

# # for type_ids_json, city_name in cursor.fetchall():
# #     if not type_ids_json or not city_name:
# #         continue
# #     try:
# #         type_ids = json.loads(type_ids_json)
# #     except Exception:
# #         continue
# #     for type_id in type_ids:
# #         key = (type_id, city_name)
# #         type_city_counts[key] = type_city_counts.get(key, 0) + 1

# # # 4. Insert counts into type_stats
# # for (type_id, city_name), count in type_city_counts.items():
# #     cursor.execute(
# #         "INSERT OR IGNORE INTO type_stats (type_id, city_name, place_count) VALUES (?, ?, ?)",
# #         (type_id, city_name, count),
# #     )
# #     cursor.execute(
# #         "UPDATE type_stats SET place_count = ? WHERE type_id = ? AND city_name = ?",
# #         (count, type_id, city_name),
# #     )

# # conn.commit()
# # conn.close()
# # print("type_stats table created and populated!")

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
# src_db = "C:/NguyenMinhTam/merged.db"  # Source DB (with place_detail)
# dst_db = "C:/NguyenMinhTam/test2/backend/app/merged.db"  # Target DB (to update)

# # Connect to both databases
# src_conn = sqlite3.connect(src_db)
# dst_conn = sqlite3.connect(dst_db)
# src_cursor = src_conn.cursor()
# dst_cursor = dst_conn.cursor()

# # Fetch all id and place_detail from source
# src_cursor.execute(
#     "SELECT place_id, place_detail_vi FROM places WHERE place_detail_vi IS NOT NULL"
# )
# rows = src_cursor.fetchall()

# # Update target DB
# for place_id, place_detail_vi in rows:
#     dst_cursor.execute(
#         "UPDATE places SET place_detail_vi = ? WHERE place_id = ?",
#         (place_detail_vi, place_id),
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

# import sqlite3


# def create_title_fts(db_path):
#     conn = sqlite3.connect(db_path)
#     cursor = conn.cursor()

#     # Drop the FTS table if it exists
#     cursor.execute("DROP TABLE IF EXISTS types_search")

#     # Create the FTS5 table with only one column
#     cursor.execute(
#         """
#         CREATE VIRTUAL TABLE types_search USING fts5(
#             type_id,
#             tokenize = 'unicode61 remove_diacritics 2'
#         )
#     """
#     )

#     # Insert data from places.title
#     cursor.execute(
#         "INSERT INTO types_search (type_id) SELECT type_id FROM type_stats WHERE type_id IS NOT NULL"
#     )

#     conn.commit()
#     conn.close()
#     print("FTS5 table 'title_fts' created and filled with titles.")


# # Usage:
# create_title_fts("C:/NguyenMinhTam/test2/backend/app/merged.db")

# import googletrans


# async def translateViToEn(txt):
#     return await _translate(txt, "vi", "en")


# async def translateEnToVi(txt):
#     return await _translate(txt, "en", "vi")


# async def detect_language(txt):
#     async with googletrans.Translator() as translator:
#         detection = await translator.detect(txt)
#         return detection.lang


# async def _translate(txt, _src, _dest):
#     res = ""
#     async with googletrans.Translator() as translator:
#         res = (await translator.translate(txt, src=_src, dest=_dest)).text
#     return res


# import sqlite3
# import json
# import asyncio
# from app.services.gtranslate_service import translateViToEn, translateEnToVi

# db_path = "C:/NguyenMinhTam/IntelligentTourPlanner/backend/app/merged.db"

# # 1. Add new columns if they don't exist
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN place_detail_vi JSON")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN place_detail_en JSON")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# conn.commit()
# conn.close()


# # 2. Translation logic (async)
# async def translate_json_fields(json_data, to_lang):
#     from_lang = "vi" if to_lang == "en" else "en"
#     translated = {}
#     for field, content in json_data.items():
#         if to_lang == "en":
#             field_trans = await translateViToEn(field)
#             content_trans = await translateViToEn(content)
#         else:
#             field_trans = await translateEnToVi(field)
#             content_trans = await translateEnToVi(content)
#         translated[field_trans] = content_trans
#     return translated


# async def process_all():
#     conn = sqlite3.connect(db_path)
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT place_id, place_detail FROM places WHERE place_detail IS NOT NULL"
#     )
#     rows = cursor.fetchall()
#     for place_id, place_detail in rows:
#         try:
#             detail_json = json.loads(place_detail)
#         except Exception:
#             continue

#         # Translate to Vietnamese (just re-save original, assuming it's already VI)
#         place_detail_vi = json.dumps(detail_json, ensure_ascii=False)

#         # Translate to English
#         place_detail_en_dict = await translate_json_fields(detail_json, "en")
#         place_detail_en = json.dumps(place_detail_en_dict, ensure_ascii=False)

#         # Update the database
#         cursor.execute(
#             "UPDATE places SET place_detail_vi = ?, place_detail_en = ? WHERE place_id = ?",
#             (place_detail_vi, place_detail_en, place_id),
#         )
#         print(f"Updated translations for place_id {place_id}")

#     conn.commit()
#     conn.close()
#     print("All place_detail translations updated!")


# if __name__ == "__main__":
#     asyncio.run(process_all())

# import requests
# import sqlite3
# import json

# db_path = "E:/test2/backend/app/merged.db"


# def google_translate(text, src, dest):
#     url = "https://translate.googleapis.com/translate_a/single"
#     params = {
#         "client": "gtx",
#         "sl": src,
#         "tl": dest,
#         "dt": "t",
#         "q": text,
#     }
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         try:
#             return response.json()[0][0][0]
#         except Exception:
#             return text
#     return text


# def translate_json_fields(json_data, to_lang):
#     from_lang = "vi" if to_lang == "en" else "en"
#     translated = {}
#     for field, content in json_data.items():
#         if to_lang == "en":
#             field_trans = google_translate(field, "vi", "en")
#             content_trans = google_translate(content, "vi", "en")
#         else:
#             field_trans = google_translate(field, "en", "vi")
#             content_trans = google_translate(content, "en", "vi")
#         translated[field_trans] = content_trans
#     return translated


# def process_all():
#     conn = sqlite3.connect(db_path)
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT place_id, place_detail FROM places WHERE place_detail IS NOT NULL"
#     )
#     rows = cursor.fetchall()
#     count = 0
#     for place_id, place_detail in rows:
#         try:
#             detail_json = json.loads(place_detail)
#         except Exception:
#             continue

#         # Vietnamese (original)
#         place_detail_vi_dict = translate_json_fields(detail_json, "vi")
#         place_detail_vi = json.dumps(place_detail_vi_dict, ensure_ascii=False)

#         # English (translated)
#         # place_detail_en_dict = translate_json_fields(detail_json, "en")
#         # place_detail_en = json.dumps(place_detail_en_dict, ensure_ascii=False)

#         cursor.execute(
#             "UPDATE places SET place_detail_vi = ? WHERE place_id = ?",
#             (place_detail_vi, place_id),
#         )
#         count += 1
#         if count % 200 == 0:
#             conn.commit()
#             print(f"Committed {count} records so far...")

#         print(f"Updated translations for place_id {place_id}")

#     conn.commit()
#     conn.close()
#     print("All place_detail translations updated!")


# if __name__ == "__main__":
#     process_all()


# def process_all(start_from=1201):
#     conn = sqlite3.connect(db_path)
#     cursor = conn.cursor()
#     # Select with OFFSET to skip the first 1200 rows
#     cursor.execute(
#         "SELECT place_id, place_detail FROM places WHERE place_detail IS NOT NULL ORDER BY place_id LIMIT -1 OFFSET ?",
#         (start_from - 1,),
#     )
#     rows = cursor.fetchall()
#     count = start_from - 1  # Start count from the offset
#     for place_id, place_detail in rows:
#         try:
#             detail_json = json.loads(place_detail)
#         except Exception:
#             continue

#         # Vietnamese (original)
#         place_detail_vi = json.dumps(detail_json, ensure_ascii=False)

#         # English (translated)
#         place_detail_en_dict = translate_json_fields(detail_json, "en")
#         place_detail_en = json.dumps(place_detail_en_dict, ensure_ascii=False)

#         cursor.execute(
#             "UPDATE places SET place_detail_vi = ?, place_detail_en = ? WHERE place_id = ?",
#             (place_detail_vi, place_detail_en, place_id),
#         )
#         count += 1
#         if count % 200 == 0:
#             conn.commit()
#             print(f"Committed {count} records so far...")

#         print(f"Updated translations for place_id {place_id}")

#     conn.commit()
#     conn.close()
#     print("All place_detail translations updated!")


# if __name__ == "__main__":
#     process_all(start_from=1201)

# import sqlite3
# import json

# db_path = "E:/test2/backend/app/merged.db"  # Update path if needed
# output_path = "place_detail_vi_export.json"

# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# cursor.execute("SELECT place_detail_vi FROM places WHERE place_detail_vi IS NOT NULL")
# rows = cursor.fetchall()

# # Each row is a tuple, so extract the first element and parse as JSON
# data = []
# for (place_detail_vi,) in rows:
#     try:
#         obj = json.loads(place_detail_vi)
#         data.append(obj)
#     except Exception:
#         print(f"Failed to parse JSON for place_detail_vi: {place_detail_vi}")

# with open(output_path, "w", encoding="utf-8") as f:
#     json.dump(data, f, ensure_ascii=False, indent=2)

# print(f"Exported {len(data)} records to {output_path}")

# import json
# import requests

# def google_translate(text, src, dest):
#     url = "https://translate.googleapis.com/translate_a/single"
#     params = {
#         "client": "gtx",
#         "sl": src,
#         "tl": dest,
#         "dt": "t",
#         "q": text,
#     }
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         try:
#             return response.json()[0][0][0]
#         except Exception:
#             return text
#     return text

# def translate_json_fields(json_data, to_lang):
#     from_lang = "vi" if to_lang == "en" else "en"
#     translated = {}
#     for field, content in json_data.items():
#         if to_lang == "en":
#             field_trans = google_translate(field, "vi", "en")
#             content_trans = google_translate(content, "vi", "en")
#         else:
#             field_trans = google_translate(field, "en", "vi")
#             content_trans = google_translate(content, "en", "vi")
#         translated[field_trans] = content_trans
#     return translated

# # Load your JSON file (list of dicts)
# with open("place_detail_vi_export.json", "r", encoding="utf-8") as f:
#     data = json.load(f)

# # Translate fields for each item
# translated_data = []
# for item in data:
#     translated_item = translate_json_fields(item, "vi")  # or "en" for English
#     translated_data.append(translated_item)
#     print ("Finished translating one item.", indexed_data:=len(translated_data))

# # Save to a new file
# with open("place_detail_vi_translated.json", "w", encoding="utf-8") as f:
#     json.dump(translated_data, f, ensure_ascii=False, indent=2)

# print("Translation complete! Saved to place_detail_vi_translated.json")

# import sqlite3

# db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN best_type_id TEXT")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# conn.commit()

# import sqlite3
# import json

# db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Ensure the column exists
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN best_type_id TEXT")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# # Build a lookup for (type_id, city_name) -> type_score
# cursor.execute("SELECT type_id, city_name, type_score FROM type_stats")
# type_score_map = {}
# for type_id, city_name, type_score in cursor.fetchall():
#     type_score_map[(type_id, city_name)] = type_score

# # For each place, find the best type_id for its city_name
# cursor.execute(
#     "SELECT id, type_ids, city_name FROM places WHERE type_ids IS NOT NULL AND city_name IS NOT NULL"
# )
# rows = cursor.fetchall()

# for place_id, type_ids_json, city_name in rows:
#     try:
#         type_ids = json.loads(type_ids_json)
#     except Exception:
#         continue
#     best_type_id = None
#     best_score = float("-inf")
#     for type_id in type_ids:
#         score = type_score_map.get((type_id, city_name))
#         if score is not None and score > best_score:
#             best_score = score
#             best_type_id = type_id
#     if best_type_id:
#         cursor.execute(
#             "UPDATE places SET best_type_id = ? WHERE id = ?", (best_type_id, place_id)
#         )

# conn.commit()
# conn.close()
# print("Updated best_type_id for all places!")

# import sqlite3

# db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Add the new column if it doesn't exist
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN best_type_id_en TEXT")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# # Update best_type_id_en by removing underscores from best_type_id
# cursor.execute("SELECT id, best_type_id FROM places WHERE best_type_id IS NOT NULL")
# rows = cursor.fetchall()

# for place_id, best_type_id in rows:
#     best_type_id_en = best_type_id.replace("_", " ")
#     cursor.execute(
#         "UPDATE places SET best_type_id_en = ? WHERE id = ?",
#         (best_type_id_en, place_id),
#     )

# conn.commit()
# conn.close()
# print("Updated best_type_id_en for all places!")

# import sqlite3
# import requests

# db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Add the new column if it doesn't exist
# try:
#     cursor.execute("ALTER TABLE places ADD COLUMN best_type_id_vn TEXT")
# except sqlite3.OperationalError:
#     pass  # Column already exists


# def google_translate(text, src, dest):
#     url = "https://translate.googleapis.com/translate_a/single"
#     params = {
#         "client": "gtx",
#         "sl": src,
#         "tl": dest,
#         "dt": "t",
#         "q": text,
#     }
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         try:
#             return response.json()[0][0][0]
#         except Exception:
#             return text
#     return text


# # Fetch all best_type_id_en values that are not null
# cursor.execute(
#     "SELECT id, best_type_id_en FROM places WHERE best_type_id_en IS NOT NULL"
# )
# rows = cursor.fetchall()

# for place_id, best_type_id_en in rows:
#     best_type_id_vn = google_translate(best_type_id_en, "en", "vi")
#     cursor.execute(
#         "UPDATE places SET best_type_id_vn = ? WHERE id = ?",
#         (best_type_id_vn, place_id),
#     )

# conn.commit()
# conn.close()
# print("Updated best_type_id_vn for all places!")

# import sqlite3

# db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# # Add the new column if it doesn't exist
# try:
#     cursor.execute("ALTER TABLE type_stats ADD COLUMN type_id_en TEXT")
# except sqlite3.OperationalError:
#     pass  # Column already exists

# # Update type_id_en by replacing underscores with spaces from type_id
# cursor.execute("SELECT id, type_id FROM type_stats WHERE type_id IS NOT NULL")
# rows = cursor.fetchall()

# for row_id, type_id in rows:
#     type_id_en = type_id.replace("_", " ")
#     cursor.execute(
#         "UPDATE type_stats SET type_id_en = ? WHERE id = ?",
#         (type_id_en, row_id),
#     )

# conn.commit()
# conn.close()
# print("Updated type_id_en for all type_stats records!")

import sqlite3
import requests

db_path = "C:/NguyenMinhTam/test2/backend/app/merged.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add the new column if it doesn't exist
try:
    cursor.execute("ALTER TABLE type_stats ADD COLUMN type_id_vi TEXT")
except sqlite3.OperationalError:
    pass  # Column already exists


def google_translate(text, src, dest):
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": src,
        "tl": dest,
        "dt": "t",
        "q": text,
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        try:
            return response.json()[0][0][0]
        except Exception:
            return text
    return text


# Fetch all type_id_en values that are not null
cursor.execute("SELECT id, type_id_en FROM type_stats WHERE type_id_en IS NOT NULL")
rows = cursor.fetchall()

for row_id, type_id_en in rows:
    type_id_vi = google_translate(type_id_en, "en", "vi")
    cursor.execute(
        "UPDATE type_stats SET type_id_vi = ? WHERE id = ?",
        (type_id_vi, row_id),
    )

conn.commit()
conn.close()
print("Updated type_id_vn for all type_stats records!")
