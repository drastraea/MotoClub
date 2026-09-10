-- +goose Up
-- Extra motorbike identification plus a closeup photo of the rider. Existing
-- rows default to empty strings; the registration form makes all four required
-- for new applications.
ALTER TABLE members ADD COLUMN motorbike_brand       text NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN motorbike_type        text NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN plate_number          text NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN rider_photo_link_path text NOT NULL DEFAULT '';

-- +goose Down
ALTER TABLE members DROP COLUMN motorbike_brand;
ALTER TABLE members DROP COLUMN motorbike_type;
ALTER TABLE members DROP COLUMN plate_number;
ALTER TABLE members DROP COLUMN rider_photo_link_path;
