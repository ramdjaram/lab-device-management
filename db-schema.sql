CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255)       NOT NULL,
    role     VARCHAR(50)        NOT NULL
);

CREATE TABLE devices
(
    id               SERIAL PRIMARY KEY,
    manufacturer     VARCHAR(100),
    model            VARCHAR(100),
    internal_name    VARCHAR(100),
    pid              VARCHAR(100),
    barcode          VARCHAR(100),
    ip_address       VARCHAR(100),
    reservation      varchar(100),
    location         VARCHAR(100),
    reservation_date TIMESTAMP,
    present_in_lab   BOOLEAN,
    user_id          INTEGER REFERENCES users (id)
);