-- schema
CREATE SCHEMA scrypto;
COMMENT ON SCHEMA scrypto IS 'Namespace for scrypto database.';


-- tables
CREATE TABLE scrypto.sc_user (
	"id" bigserial NOT NULL,
	"email" varchar(255) UNIQUE NOT NULL,
	"password" TEXT NOT NULL,
	"seed" TEXT NOT NULL,
	"name" varchar(255) NOT NULL,
	"active" boolean NOT NULL DEFAULT false,
	"created_date" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT sc_user_pk PRIMARY KEY ("id")
);

CREATE TABLE scrypto.sc_currency_data (
	"id" bigserial NOT NULL,
	"rate" numeric NOT NULL,
	"name" varchar(20) NOT NULL,
	"type" TEXT NOT NULL,
	"amount" numeric NOT NULL,
	"sequence" TEXT NOT NULL,
	"created_date" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT sc_currency_data_pk PRIMARY KEY ("id")
);

CREATE TABLE scrypto.sc_currency (
	"name" varchar(20) NOT NULL,
	"first" varchar(10) NOT NULL,
	"second" varchar(10) NOT NULL,
	CONSTRAINT sc_currency_pk PRIMARY KEY ("name")
);

CREATE TABLE scrypto.sc_user_currency_rate (
	"user" bigint NOT NULL,
	"currency" varchar(20) NOT NULL,
	"rate" numeric(20) NOT NULL DEFAULT 999999 CHECK ("rate" <= 0.9 OR "rate" >= 1.1),
	CONSTRAINT sc_user_currency_rate_pk PRIMARY KEY ("user","currency")
);


ALTER TABLE scrypto.sc_currency_data
    ADD CONSTRAINT "sc_sc_currency_data_fk0"
    FOREIGN KEY ("name") REFERENCES scrypto.sc_currency("name");

ALTER TABLE scrypto.sc_user_currency_rate
    ADD CONSTRAINT "sc_user_currency_rate_fk0"
    FOREIGN KEY ("user") REFERENCES scrypto.sc_user("id");

ALTER TABLE scrypto.sc_user_currency_rate
    ADD CONSTRAINT "sc_user_currency_rate_fk1"
    FOREIGN KEY ("currency") REFERENCES scrypto.sc_currency("name");


-- indexes
CREATE INDEX sc_user_currency_rate_currency ON scrypto.sc_user_currency_rate(currency);


-- views
CREATE OR REPLACE VIEW scrypto.sc_latest_currency_data_view AS
    SELECT cd.id AS id, c.second AS second, c.first AS first, cd.amount AS amount,
        cd.rate AS rate, cd.type AS type, cd.name AS name, ucr.rate AS multiplier, ucr.user AS user_id
	FROM scrypto.sc_currency_data AS cd
	INNER JOIN (SELECT MAX(cd1.created_date) AS max_created_date
		FROM scrypto.sc_currency_data AS cd1
		GROUP BY cd1.type, cd1.name) AS cd3
		ON (cd.created_date = cd3.max_created_date)
	INNER JOIN scrypto.sc_currency AS c
		ON c.name = cd.name
	INNER JOIN scrypto.sc_user_currency_rate AS ucr
	    ON ucr.currency = c.name;

CREATE OR REPLACE VIEW scrypto.sc_unique_first_currencies AS
    SELECT DISTINCT c.first AS name FROM scrypto.sc_currency AS c;


-- types
CREATE TYPE scrypto.sc_latest_currency_data AS (
    id bigint,
    first varchar(10),
    second varchar(10),
    amount numeric,
    rate numeric,
    type text,
    name varchar(20),
    multiplier numeric
);

CREATE TYPE scrypto.sc_active_user AS (
    id bigint,
    email varchar(255),
    password text,
    name varchar(255),
    seed text
);

CREATE TYPE scrypto.sc_new_user AS (
    id bigint,
    name varchar(255),
    email varchar(255)
);

CREATE TYPE scrypto.sc_deactivated_user AS (
    name varchar(255),
    email varchar(255)
);

CREATE TYPE scrypto.sc_activated_user AS (
    name varchar(255),
    email varchar(255)
);

CREATE TYPE scrypto.sc_updated_user AS (
    name varchar(255),
    email varchar(255)
);

-- functions
CREATE OR REPLACE FUNCTION scrypto.sc_activate_user(user_id bigint) RETURNS scrypto.sc_activated_user AS $$
    UPDATE scrypto.sc_user SET active = false WHERE id = user_id;
    SELECT u.email AS email, u.name AS name FROM scrypto.sc_user AS u WHERE u.id = user_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.sc_change_password(password text, seed text, user_id bigint)
RETURNS scrypto.sc_updated_user AS $$
    UPDATE scrypto.sc_user SET password = password, seed = seed WHERE id = user_id AND active = true;
    SELECT u.email AS email, u.name AS name FROM scrypto.sc_user AS u WHERE u.id = user_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.sc_get_user_by_email_or_id(email varchar(255), user_id bigint)
RETURNS SETOF scrypto.sc_active_user AS $$
    SELECT u.id, u.email, u.password, u.name, u.seed
            FROM scrypto.sc_user AS u
            WHERE (u.email = email OR u.id = user_id);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.sc_create_user(email varchar(255), password text, seed text, name varchar(255))
RETURNS scrypto.sc_new_user AS $$
    INSERT INTO scrypto.sc_user(email, password, seed, name) VALUES(email, password, seed, name);
    SELECT u.id, u.name, u.email FROM scrypto.sc_user AS u WHERE u.email = email LIMIT 1;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.sc_get_latest_currency_data(name_param varchar(10), user_id_param bigint)
RETURNS SETOF scrypto.sc_latest_currency_data AS $$
        SELECT id, second, first, amount, rate, type, name, multiplier
            FROM scrypto.sc_latest_currency_data_view
            WHERE lower(first) = lower(name_param) AND user_id = user_id_param;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.sc_deactivate_user(user_id bigint) RETURNS scrypto.sc_deactivated_user AS $$
    UPDATE scrypto.sc_user SET active = false WHERE id = user_id;
    SELECT u.email AS email, u.name AS name FROM scrypto.sc_user AS u WHERE u.id = user_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.process_currency_rate() RETURNS trigger AS $$
    BEGIN
        IF (TG_OP = 'INSERT' AND NEW.active = true) OR (TG_OP = 'UPDATE' AND NEW.active = true AND OLD.active = false)
        THEN
            INSERT INTO scrypto.sc_user_currency_rate ("user", currency)
                SELECT DISTINCT NEW.id AS "user", name FROM scrypto.sc_currency;
        ELSIF TG_OP = 'UPDATE' AND NEW.active = false AND OLD.active = true THEN
            DELETE FROM scrypto.sc_user_currency_rate WHERE "user" = NEW.id;
        END IF;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scrypto.split_name() RETURNS trigger AS $$
    BEGIN
        NEW.first := split_part(NEW.name, '_', 1);
        NEW.second := split_part(NEW.name, '_', 2);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scrypto.notify_new_currency() RETURNS trigger AS $$
    BEGIN
        PERFORM pg_notify('new_currency', json_build_object('name', NEW.name)::text);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scrypto.notify_exceeded_currency_rate() RETURNS trigger AS $$
    DECLARE
        diff TIMESTAMP;
        min_val NUMERIC;
        exceeded_currency_rate_array JSON;
    BEGIN
        diff := NEW.created_date - interval'12 hours';

        SELECT min(cd.rate) INTO min_val
            FROM scrypto.sc_currency_data AS cd
            WHERE cd.created_date >= diff AND cd.name = NEW.name;

        SELECT array_to_json(array_agg(t)) INTO exceeded_currency_rate_array
            FROM (
                SELECT ucr.currency AS name, NEW.rate AS rate, ucr.rate AS currency_rate, ucr.user AS user_id
                    FROM scrypto.sc_user_currency_rate AS ucr
                    WHERE ucr.currency = NEW.name AND NEW.rate / min_val > ucr.rate
            ) AS t;

        IF (json_array_length(exceeded_currency_rate_array) > 0) THEN
            PERFORM pg_notify('exceeded_currency_rate', exceeded_currency_rate_array::text);
            UPDATE scrypto.sc_user_currency_rate
                SET rate = rate + (rate * 0.5)
                WHERE currency = NEW.name AND NEW.rate / min_val > rate;
        END IF;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scrypto.notify_new_currency_data() RETURNS trigger AS $$
    BEGIN
        PERFORM pg_notify('new_currency_data',
            json_build_object(
                'id', NEW.id,
                'rate', NEW.rate,
                'name', NEW.name,
                'first', split_part(NEW.name, '_', 1),
                'second', split_part(NEW.name, '_', 2),
                'type', NEW.type,
                'amount', NEW.amount,
                'sequence', NEW.sequence,
                'created_date', NEW.created_date
            )::text
        );
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION scrypto.create_currency(name varchar(20)) RETURNS void AS $$
    INSERT INTO scrypto.sc_currency(name) VALUES(name);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.create_currecy_data(
    rate numeric, type varchar, amount numeric, sequence varchar, name varchar(20))
    RETURNS void AS $$
        INSERT INTO scrypto.sc_currency_data(rate, type, amount, sequence, name)
            VALUES(rate, type, amount, sequence, name);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION scrypto.clear_old_currency_data() RETURNS void AS $$
    DECLARE
        diff TIMESTAMP;
    BEGIN
        diff := current_timestamp - interval'24 hours';
        DELETE FROM scrypto.sc_currency_data WHERE created_date <= diff;
    END;
$$ LANGUAGE plpgsql;

-- triggers
CREATE TRIGGER sc_currency_split_name
    BEFORE INSERT ON scrypto.sc_currency
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.split_name();

CREATE TRIGGER sc_currency_notify_new_currency
    AFTER INSERT ON scrypto.sc_currency
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.notify_new_currency();

CREATE TRIGGER sc_currency_data_notify_new_currency_data
    AFTER INSERT ON scrypto.sc_currency_data
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.notify_new_currency_data();

CREATE TRIGGER sc_currency_data_notify_exceeded_currency_rate
    AFTER INSERT ON scrypto.sc_currency_data
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.notify_exceeded_currency_rate();

CREATE TRIGGER sc_user_process_currency_rate
    AFTER INSERT OR UPDATE ON scrypto.sc_user
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.process_currency_rate();