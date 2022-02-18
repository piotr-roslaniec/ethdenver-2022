export interface Account {
  private_key: string;
  view_key: string;
  address: string;
}

export interface TransactionRecipient {
  address: string;
  value: number;
}

export interface Record {
  owner: string;
  is_dummy: number;
  value: number;
  payload: unknown;
  birth_program_id: string;
  death_program_id: string;
  serial_number_nonce: string;
  commitment: string;
  commitment_randomness: string;
}

export interface RawTransaction {
  encoded_transaction: string;
  encoded_records: Array<string>;
}

export interface Block {
  confirmations: number;
  difficulty_target: number;
  hash: string;
  height: number;
  merkle_root: string;
  nonce: number;
  pedersen_merkle_root_hash: string;
  previous_block_hash: string;
  proof: string;
  size: number;
  time: number;
  transactions: Array<string>;
}

export interface Transaction {
  txid: string;
  size: number;
  old_serial_numbers: Array<unknown>;
  new_commitments: Array<unknown>;
  memo: string;
  network_id: number;
  digest: string;
  transaction_proof: string;
  program_commitment: string;
  local_data_root: string;
  value_balance: number;
  signatures: Array<string>;
  encrypted_records: Array<unknown>;
  transaction_metadata: unknown;
}

export interface BlockTemplate {
  previous_block_hash: string;
  block_height: number;
  time: number;
  difficulty_target: number;
  transactions: Array<unknown>;
  coinbase_value: number;
}

export interface NetworkGraph {
  node_count: number;
  connection_count: number;
  density: number;
  algebraic_connectivity: number;
  degree_centrality_delta: number;
  edges: Array<unknown>;
  vertices: Array<unknown>;
}

export interface NodeInfo {
  is_bootnode: boolean;
  is_miner: boolean;
  is_syncing: boolean;
  launched: number;
  listening_addr: string;
  version: string;
}

export interface NodeStatus {
  connections: unknown;
  handshakes: unknown;
  inbound: unknown;
  misc: unknown;
  outbound: unknown;
  queues: unknown;
}

export interface PeerInfo {
  peers: Array<string>;
}
