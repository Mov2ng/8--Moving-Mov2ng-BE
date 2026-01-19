-- This is an empty migration.
DROP TRIGGER IF EXISTS history_user ON "User";
DROP TRIGGER IF EXISTS history_service ON "Service";
DROP TRIGGER IF EXISTS history_region ON "Region";
DROP TRIGGER IF EXISTS history_notice ON "Notice";
DROP TRIGGER IF EXISTS history_driver ON "Driver";
DROP TRIGGER IF EXISTS history_like ON "Like";
DROP TRIGGER IF EXISTS history_review ON "Review";
DROP TRIGGER IF EXISTS history_favorite_driver ON "FavoriteDriver";
DROP TRIGGER IF EXISTS history_request ON "Request";
DROP TRIGGER IF EXISTS history_estimate ON "estimate";

CREATE OR REPLACE FUNCTION log_history() RETURNS trigger AS $$
DECLARE
  payload jsonb;
  action "TaskType";
  tbl "tableName";
BEGIN
  IF TG_OP = 'INSERT' THEN
    payload := to_jsonb(NEW);
    action := 'CREATE';
  ELSIF TG_OP = 'UPDATE' THEN
    payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    action := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN
    payload := to_jsonb(OLD);
    action := 'DELETE';
  END IF;

  tbl := CASE TG_TABLE_NAME
    WHEN 'User' THEN 'USER'
    WHEN 'Service' THEN 'SERVICE'
    WHEN 'Region' THEN 'REGION'
    WHEN 'Notice' THEN 'NOTICE'
    WHEN 'Driver' THEN 'DRIVER'
    WHEN 'Like' THEN 'LIKE'
    WHEN 'Review' THEN 'REVIEW'
    WHEN 'FavoriteDriver' THEN 'FavoriteDriver'
    WHEN 'Request' THEN 'Request'
    WHEN 'estimate' THEN 'estimate'
    ELSE NULL
  END;

  IF tbl IS NULL THEN
    RAISE EXCEPTION 'Unsupported table for history: %', TG_TABLE_NAME;
  END IF;

  INSERT INTO "History"(table_name, task_type, data, "createdAt", "updatedAt")
  VALUES (tbl, action, payload::text, now(), now());

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER history_user
AFTER INSERT OR UPDATE OR DELETE ON "User"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_service
AFTER INSERT OR UPDATE OR DELETE ON "Service"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_region
AFTER INSERT OR UPDATE OR DELETE ON "Region"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_notice
AFTER INSERT OR UPDATE OR DELETE ON "Notice"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_driver
AFTER INSERT OR UPDATE OR DELETE ON "Driver"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_like
AFTER INSERT OR UPDATE OR DELETE ON "Like"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_review
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_favorite_driver
AFTER INSERT OR UPDATE OR DELETE ON "FavoriteDriver"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_request
AFTER INSERT OR UPDATE OR DELETE ON "Request"
FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER history_estimate
AFTER INSERT OR UPDATE OR DELETE ON "estimate"
FOR EACH ROW EXECUTE FUNCTION log_history();
