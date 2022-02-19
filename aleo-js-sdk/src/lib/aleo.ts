import {
  Account,
  Block,
  BlockTemplate,
  NetworkGraph,
  NodeInfo,
  NodeStatus,
  PeerInfo,
  RawTransaction,
  Record,
  Transaction,
  TransactionRecipient,
} from './response_type';
import { RPC } from './rpc';

export class AleoAuthClient {
  private rpc: RPC;

  /**
   * Creates an instance of AleoAuthClient.
   * @param {string} uri - Aleo Private RPC Endpoints
   * @param {string} user - RPC Endpoints auth username
   * @param {string} password - RPC Endpoints auth password
   * @param {RequestInit} [options] - request extra info
   * @memberof AleoAuthClient
   */
  constructor(
    uri: string,
    user: string,
    password: string,
    options?: RequestInit
  ) {
    this.rpc = new RPC(uri, options, user, password);
  }

  /**
   * Creates a new account private key and its corresponding account address.
   *
   * @return {*}  {Promise<Account>}
   * @memberof AleoAuthClient
   */
  async create_account(): Promise<Account> {
    return await this.rpc.call('create_account');
  }

  /**
   * Creates a new transaction and returns the encoded transaction along with the encoded records.
   *
   * @param {Array<string>} old_records - An array of hex encoded records to be spent
   * @param {Array<string>} old_account_private_keys - An array of private keys authorized to spend the records
   * @param {Array<TransactionRecipient>} recipients - The array of transaction recipient objects
   * @param {string} memo - The transaction memo
   * @param {number} network_id - The network id of the transaction
   * @return {*}  {Promise<RawTransaction>}
   * @memberof AleoAuthClient
   */
  async create_raw_transaction(
    old_records: Array<string>,
    old_account_private_keys: Array<string>,
    recipients: Array<TransactionRecipient>,
    memo: string,
    network_id: number
  ): Promise<RawTransaction> {
    return await this.rpc.call(
      'createrawtransaction',
      old_records,
      old_account_private_keys,
      recipients,
      memo,
      network_id
    );
  }

  /**
   * Create a new transaction from a given transaction kernel, returning the encoded transaction and the new records.
   *
   * @param {Array<string>} private_keys - An array of private key strings
   * @param {string} transaction_kernel - The hex encoded transaction kernel
   * @return {*}  {Promise<RawTransaction>}
   * @memberof AleoAuthClient
   */
  async create_transaction(
    private_keys: Array<string>,
    transaction_kernel: string
  ): Promise<RawTransaction> {
    return await this.rpc.call(
      'createtransaction',
      private_keys,
      transaction_kernel
    );
  }

  /**
   * Create a new transaction kernel.
   *
   * @param {Array<string>} old_records - An array of hex encoded records to be spent
   * @param {Array<string>} old_account_private_keys - An array of private keys authorized to spend the records
   * @param {Array<TransactionRecipient>} recipients - The array of transaction recipient objects
   * @param {string} memo -The transaction memo
   * @param {number} network_id - The network id of the transaction
   * @return {*}  {Promise<string>} - The hex encoded transaction kernel
   * @memberof AleoAuthClient
   */
  async create_transaction_kernel(
    old_records: Array<string>,
    old_account_private_keys: Array<string>,
    recipients: Array<TransactionRecipient>,
    memo: string,
    network_id: number
  ): Promise<string> {
    return await this.rpc.call(
      'createtransactionkernel',
      old_records,
      old_account_private_keys,
      recipients,
      memo,
      network_id
    );
  }

  /**
   * Returns information about a record from serialized record hex.
   *
   * @param {string} record_bytes - The raw record hex to decode
   * @return {*}  {Promise<Record>}
   * @memberof AleoAuthClient
   */
  async decode_record(record_bytes: string): Promise<Record> {
    return await this.rpc.call('decoderecord', record_bytes);
  }

  /**
   * Decrypts the encrypted record and returns the hex encoded bytes of the record.
   *
   * @param {string} encrypted_record - The encrypted record
   * @param {string} account_view_key - The account view key used to decrypt the ciphertext
   * @return {*}  {Promise<string>} - The hex-encoded record bytes
   * @memberof AleoAuthClient
   */
  async decrypt_record(
    encrypted_record: string,
    account_view_key: string
  ): Promise<string> {
    return await this.rpc.call(
      'decryptrecord',
      encrypted_record,
      account_view_key
    );
  }

  /**
   * Disconnects the node from the given address.
   *
   * @param {string} address - The address to disconnect in an IP:port format
   * @return {*}  {Promise<unknown>}
   * @memberof AleoAuthClient
   */
  async disconnect(address: string): Promise<unknown> {
    return await this.rpc.call('disconnect', address);
  }

  /**
   * Returns the hex encoded bytes of a record from its record commitment.
   *
   * @param {string} record_commitment - The record commitment
   * @return {*}  {Promise<string>} - The hex-encoded record bytes
   * @memberof AleoAuthClient
   */
  async get_raw_record(record_commitment: string): Promise<string> {
    return await this.rpc.call('getrawrecord', record_commitment);
  }

  /**
   * Returns the number of record commitments that are stored on the full node.
   *
   * @return {*}  {Promise<number>} - The number of stored record commitments
   * @memberof AleoAuthClient
   */
  async get_record_commitment_count(): Promise<number> {
    return await this.rpc.call('getrecordcommitmentcount');
  }

  /**
   * Returns a list of record commitments that are stored on the full node.
   *
   * @return {*}  {Promise<Array<string>>} - The list of stored record commitments
   * @memberof AleoAuthClient
   */
  async get_record_commitments(): Promise<Array<string>> {
    return await this.rpc.call('getrecordcommitments');
  }
}

export class AleoClient {
  private rpc: RPC;

  /**
   * Creates an instance of AleoClient.
   * @param {string} uri - Aleo Public RPC Endpoints
   * @param {RequestInit} [options] - request extra info
   * @memberof AleoClient
   */
  constructor(uri: string, options?: RequestInit) {
    this.rpc = new RPC(uri, options);
  }

  /**
   * Returns information about a transaction from serialized transaction bytes.
   *
   * @param {string} transaction_bytes - The raw transaction hex to decode
   * @return {*}  {Promise<Transaction>}
   * @memberof AleoClient
   */
  async decode_raw_transaction(
    transaction_bytes: string
  ): Promise<Transaction> {
    return await this.rpc.call('decoderawtransaction', transaction_bytes);
  }

  /**
   * Returns the block hash of the head of the best valid chain.
   *
   * @return {*}  {Promise<string>} - The block height of the requested block hash
   * @memberof AleoClient
   */
  async get_best_block_hash(): Promise<string> {
    return await this.rpc.call('getbestblockhash');
  }

  /**
   * Returns information about a block from a block hash.
   *
   * @param {string} block_hash - The block hash of the requested block
   * @return {*}  {Promise<Block>}
   * @memberof AleoClient
   */
  async get_block(block_hash: string): Promise<Block> {
    return await this.rpc.call('getblock', block_hash);
  }

  /**
   * Returns the number of blocks in the best valid chain.
   *
   * @return {*}  {Promise<number>} - The number of blocks in the best valid chain
   * @memberof AleoClient
   */
  async get_block_count(): Promise<number> {
    return await this.rpc.call('getblockcount');
  }

  /**
   * Returns the block hash of a block at the given block height in the best valid chain.
   *
   * @param {number} block_height - The block height of the requested block hash
   * @return {*}  {Promise<string>} - The block hash of the block at the given block height
   * @memberof AleoClient
   */
  async get_block_hash(block_height: number): Promise<string> {
    return await this.rpc.call('getblockhash', block_height);
  }

  /**
   * Returns the current mempool and consensus information known by this node.
   *
   * @return {*}  {Promise<BlockTemplate>}
   * @memberof AleoClient
   */
  async get_block_template(): Promise<BlockTemplate> {
    return await this.rpc.call('getblocktemplate');
  }

  /**
   * Returns the number of connected peers this node has.
   *
   * @return {*}  {Promise<number>} - The number of connected nodes
   * @memberof AleoClient
   */
  async get_connection_count(): Promise<number> {
    return await this.rpc.call('getconnectioncount');
  }

  /**
   * Returns the network graph crawled by this node (if it is a bootnode).
   *
   * @return {*}  {Promise<NetworkGraph>}
   * @memberof AleoClient
   */
  async get_network_graph(): Promise<NetworkGraph> {
    return await this.rpc.call('getnetworkgraph');
  }

  /**
   * Returns information about the node.
   *
   * @return {*}  {Promise<NodeInfo>}
   * @memberof AleoClient
   */
  async get_node_info(): Promise<NodeInfo> {
    return await this.rpc.call('getnodeinfo');
  }

  /**
   * Returns statistics related to the node.
   *
   * @return {*}  {Promise<NodeStatus>}
   * @memberof AleoClient
   */
  async get_node_status(): Promise<NodeStatus> {
    return await this.rpc.call('getnodestats');
  }

  /**
   * Returns the node's connected peers.
   *
   * @return {*}  {Promise<PeerInfo>}
   * @memberof AleoClient
   */
  async get_peer_info(): Promise<PeerInfo> {
    return await this.rpc.call('getpeerinfo');
  }

  /**
   *
   *
   * @param {string} transaction_id - The transaction id of the requested transaction hex
   * @return {*}  {Promise<string>} - The hex-encoded transaction bytes
   * @memberof AleoClient
   */
  async get_raw_transaction(transaction_id: string): Promise<string> {
    return await this.rpc.call('getrawtransaction', transaction_id);
  }

  /**
   * Returns information about a transaction from a transaction id.
   *
   * @param {string} transaction_id -The transaction id of the requested transaction info
   * @return {*}  {Promise<Transaction>}
   * @memberof AleoClient
   */
  async get_transaction_info(transaction_id: string): Promise<Transaction> {
    return await this.rpc.call('gettransactioninfo', transaction_id);
  }

  /**
   * Send raw transaction bytes to this node to be added into the mempool. If valid, the transaction will be stored and propagated to all peers.
   *
   * @param {string} transaction_bytes - The raw transaction hex to broadcast
   * @return {*}  {Promise<string>} - The transaction id of the sent transaction
   * @memberof AleoClient
   */
  async send_transaction(transaction_bytes: string): Promise<string> {
    return await this.rpc.call('sendtransaction', transaction_bytes);
  }

  /**
   * Validate and return if the transaction is valid.
   *
   * @param {string} transaction_bytes - The raw transaction hex to validate
   * @return {*}  {Promise<boolean>} - Check that the transaction is valid
   * @memberof AleoClient
   */
  async validate_raw_transaction(transaction_bytes: string): Promise<boolean> {
    return await this.rpc.call('validaterawtransaction', transaction_bytes);
  }

    /**
   * Get latest block from the network.
   *
   * @return {*}  {Promise<Block>} - The latest block
   * @memberof AleoClient
   */
     async get_latest_block(transaction_bytes: string): Promise<Block> {
      return await this.rpc.call('latestblock', transaction_bytes);
    }
}
