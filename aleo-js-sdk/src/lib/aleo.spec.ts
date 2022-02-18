import test from 'ava';

import { AleoClient } from '../index';

const aleoClient: AleoClient = new AleoClient('http://127.0.0.1:3030/');

test('get_best_block_hash', async (t) => {
  //   t.is(double(2), 4);
  const res = await aleoClient.get_best_block_hash();
  console.log('get_best_block_hash: ', res);
  t.pass();
});

test('get_block', async (t) => {
  const res = await aleoClient.get_block(
    '99338dff33f197c61eeefec439ccafbea19d9d044e21efcece079619daa795d1'
  );
  console.log('get_block: ', res);
  t.pass();
});

test('get_block_template', async (t) => {
  const res = await aleoClient.get_block_template();
  console.log('get_block_template: ', res);
  t.pass();
});

test('get_node_status', async (t) => {
  const res = await aleoClient.get_node_status();
  console.log('get_node_status: ', res);
  t.pass();
});
