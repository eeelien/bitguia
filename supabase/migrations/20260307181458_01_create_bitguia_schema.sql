/*
  # Create BitGuía Database Schema

  1. New Tables
    - `chat_messages` - Store AI agent conversation history
      - `id` (uuid, primary key)
      - `user_id` (text) - Session identifier
      - `message` (text) - User message
      - `response` (text) - AI agent response
      - `created_at` (timestamp)

    - `simulator_trades` - Store simulated buy/sell trades
      - `id` (uuid, primary key)
      - `user_id` (text) - Session identifier
      - `type` (text) - 'buy' or 'sell'
      - `amount_mxn` (numeric) - Amount in MXN
      - `btc_amount` (numeric) - Amount in BTC
      - `price_mxn` (numeric) - Price at time of trade
      - `created_at` (timestamp)

    - `simulator_portfolio` - Track current portfolio state
      - `id` (uuid, primary key)
      - `user_id` (text) - Session identifier
      - `balance_mxn` (numeric) - Current MXN balance
      - `btc_balance` (numeric) - Current BTC balance
      - `updated_at` (timestamp)

  2. Security
    - RLS disabled (public read/write for demo purposes)
    - Session-based access using user_id
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulator_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  amount_mxn numeric NOT NULL,
  btc_amount numeric NOT NULL,
  price_mxn numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulator_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  balance_mxn numeric DEFAULT 10000,
  btc_balance numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_simulator_trades_user_id ON simulator_trades(user_id);
