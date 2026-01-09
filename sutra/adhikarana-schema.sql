-- Adhikarana Database Schema
-- Generated: 2026-01-09T09:49:15.455Z

-- Table: adhikaranas
CREATE TABLE adhikaranas (
  id SERIAL PRIMARY KEY,
  adhikarana_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_adhikaranas_adhikarana_id ON adhikaranas(adhikarana_id);

-- Table: adhikarana_details
CREATE TABLE adhikarana_details (
  id SERIAL PRIMARY KEY,
  adhikarana_id VARCHAR(20) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  content TEXT,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adhikarana_id) REFERENCES adhikaranas(adhikarana_id) ON DELETE CASCADE,
  UNIQUE(adhikarana_id, field_type, language)
);

CREATE INDEX idx_adhikarana_details_adhikarana_id ON adhikarana_details(adhikarana_id);
CREATE INDEX idx_adhikarana_details_field_type ON adhikarana_details(field_type);
CREATE INDEX idx_adhikarana_details_language ON adhikarana_details(language);

-- Column descriptions
COMMENT ON TABLE adhikaranas IS 'Adhikaranas (topics/sections) of the text';
COMMENT ON COLUMN adhikaranas.adhikarana_id IS 'Unique identifier (e.g., Adhikarana_001)';
COMMENT ON COLUMN adhikaranas.name IS 'Sanskrit name of the adhikarana';

COMMENT ON TABLE adhikarana_details IS 'Detailed fields for each adhikarana';
COMMENT ON COLUMN adhikarana_details.field_type IS 'Type of detail (topic, samshaya, purvapaksha, siddhanta, notes, references)';
COMMENT ON COLUMN adhikarana_details.content IS 'The actual content for this field';
COMMENT ON COLUMN adhikarana_details.language IS 'Language code (en, ka, ta, etc.)';

