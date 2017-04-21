-- schema
CREATE SCHEMA scrypto;
COMMENT ON SCHEMA scrypto IS 'Namespace for scrypto database.';


-- tables
CREATE TABLE scrypto.sc_user (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "created_date" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT sc_user_pk PRIMARY KEY ("id")
);

CREATE TABLE scrypto.sc_currency_data (
    "id" BIGSERIAL NOT NULL,
    "rate" NUMERIC NOT NULL,
    "name" varchar(20),
    "type" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "sequence" TEXT NOT NULL,
    "created_date" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT sc_currency_data_pk PRIMARY KEY ("id")
);

CREATE TABLE scrypto.sc_currency (
    "name" VARCHAR(20) NOT NULL,
    "first" VARCHAR(10) NOT NULL,
    "second" VARCHAR(10) NOT NULL,
    "rate" NUMERIC NOT NULL DEFAULT 999999 CHECK ("rate" <= 0.9 OR "rate" >= 1.1),
    CONSTRAINT sc_currency_pk PRIMARY KEY ("name")
);

ALTER TABLE scrypto.sc_currency_data
    ADD CONSTRAINT sc_currency_data_fk0
    FOREIGN KEY ("name")
    REFERENCES scrypto.sc_currency("name");


-- views
CREATE OR REPLACE VIEW scrypto.sc_newest_currency_data AS
    SELECT cd.id AS id, c.second AS second, c.first AS first, cd.amount AS amount,
        cd.rate AS rate, cd.type AS type, cd.name AS name, c.rate AS multiplier
	FROM scrypto.sc_currency_data AS cd
	INNER JOIN (SELECT MAX(cd1.created_date) AS max_created_date
		FROM scrypto.sc_currency_data AS cd1
		GROUP BY cd1.type, cd1.name) AS cd3
		ON (cd.created_date = cd3.max_created_date)
	INNER JOIN scrypto.sc_currency AS c
		ON c.name = cd.name


-- functions
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

CREATE OR REPLACE FUNCTION scrypto.notify_new_currency_data() RETURNS trigger AS $$
    DECLARE
        diff TIMESTAMP;
        min_val NUMERIC;
        rate NUMERIC;
        newRate NUMERIC;
    BEGIN
        PERFORM pg_notify('new_currency_data',
            json_build_object(
                'id', NEW.id,
                'rate', NEW.rate,
                'name', NEW.name,
                'type', NEW.type,
                'amount', NEW.amount,
                'sequence', NEW.sequence,
                'created_date', NEW.created_date
            )::text
        )

        diff := NEW.created_date - interval'12 hours';
        SELECT min(cd.rate) INTO min_val FROM scrypto.sc_currency_data AS cd WHERE cd.created_date >= diff AND cd.name = NEW.name;
        SELECT cu.rate INTO rate FROM scrypto.sc_currency AS cu WHERE cu.name = NEW.name;
        IF (NEW.rate / min_val > rate) THEN
            PERFORM pg_notify('send_message',
                json_build_object(
                    'name', NEW.name,
                    'rate', NEW.rate,
                    'currency_rate', rate
                )::text
            );
            newRate := rate + (rate * 0.5);
            UPDATE scrypto.sc_currency SET rate = newRate WHERE name = NEW.name;
        END IF;
        RETURN NEW;
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

CREATE TRIGGER sc_currency_data_notify_send_sms
    AFTER INSERT ON scrypto.sc_currency_data
    FOR EACH ROW
    EXECUTE PROCEDURE scrypto.notify_new_currency_data();