(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.aleoWasmBundler = factory());
})(this, (function () {
	'use strict';

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', { value: true });
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var global$1 = (typeof global !== "undefined" ? global :
		typeof self !== "undefined" ? self :
			typeof window !== "undefined" ? window : {});

	let wasm;

	// TextEncoder/TextDecoder polyfills for utf-8 - an implementation of TextEncoder/TextDecoder APIs
	// Written in 2013 by Viktor Mukhachev <vic99999@yandex.ru>
	// To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
	// You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

	// Some important notes about the polyfill below:
	// Native TextEncoder/TextDecoder implementation is overwritten
	// String.prototype.codePointAt polyfill not included, as well as String.fromCodePoint
	// TextEncoder.prototype.encode returns a regular array instead of Uint8Array
	// No options (fatal of the TextDecoder constructor and stream of the TextDecoder.prototype.decode method) are supported.
	// TextDecoder.prototype.decode does not valid byte sequences
	// This is a demonstrative implementation not intended to have the best performance

	// http://encoding.spec.whatwg.org/#textencoder

	// http://encoding.spec.whatwg.org/#textencoder

	function TextEncoder() {
	}

	TextEncoder.prototype.encode = function (string) {
		var octets = [];
		if (!string) {
			return octets;
		}
		var length = string.length;
		var i = 0;
		while (i < length) {
			var codePoint = string.codePointAt(i);
			var c = 0;
			var bits = 0;
			if (codePoint <= 0x0000007F) {
				c = 0;
				bits = 0x00;
			} else if (codePoint <= 0x000007FF) {
				c = 6;
				bits = 0xC0;
			} else if (codePoint <= 0x0000FFFF) {
				c = 12;
				bits = 0xE0;
			} else if (codePoint <= 0x001FFFFF) {
				c = 18;
				bits = 0xF0;
			}
			octets.push(bits | (codePoint >> c));
			c -= 6;
			while (c >= 0) {
				octets.push(0x80 | ((codePoint >> c) & 0x3F));
				c -= 6;
			}
			i += codePoint >= 0x10000 ? 2 : 1;
		}
		return octets;
	};

	function TextDecoder() {
	}

	TextDecoder.prototype.decode = function (octets) {
		var string = "";
		if (!octets) {
			return string;
		}
		var i = 0;
		while (i < octets.length) {
			var octet = octets[i];
			var bytesNeeded = 0;
			var codePoint = 0;
			if (octet <= 0x7F) {
				bytesNeeded = 0;
				codePoint = octet & 0xFF;
			} else if (octet <= 0xDF) {
				bytesNeeded = 1;
				codePoint = octet & 0x1F;
			} else if (octet <= 0xEF) {
				bytesNeeded = 2;
				codePoint = octet & 0x0F;
			} else if (octet <= 0xF4) {
				bytesNeeded = 3;
				codePoint = octet & 0x07;
			}
			if (octets.length - i - bytesNeeded > 0) {
				var k = 0;
				while (k < bytesNeeded) {
					octet = octets[i + k + 1];
					codePoint = (codePoint << 6) | (octet & 0x3F);
					k += 1;
				}
			} else {
				codePoint = 0xFFFD;
				bytesNeeded = octets.length - i;
			}
			string += String.fromCodePoint(codePoint);
			i += bytesNeeded + 1;
		}
		return string
	};

	let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

	cachedTextDecoder.decode();

	let cachegetUint8Memory0 = null;
	function getUint8Memory0() {
		if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
			cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
		}
		return cachegetUint8Memory0;
	}

	function getStringFromWasm0(ptr, len) {
		return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
	}

	const heap = new Array(32).fill(undefined);

	heap.push(undefined, null, true, false);

	let heap_next = heap.length;

	function addHeapObject(obj) {
		console.log(`addHeapObject`);
		console.log({ obj });
		console.log({ heap });
		if (heap_next === heap.length) heap.push(heap.length + 1);
		const idx = heap_next;
		console.log({ idx });
		heap_next = heap[idx];

		heap[idx] = obj;
		return idx;
	}

	function getObject(idx) {
		console.log(`getObject(${idx})`);
		return heap[idx];
	}

	function dropObject(idx) {
		if (idx < 36) return;
		heap[idx] = heap_next;
		heap_next = idx;
	}

	function takeObject(idx) {
		console.log(`takeObject(${idx})`);
		const ret = getObject(idx);
		dropObject(idx);
		return ret;
	}

	let WASM_VECTOR_LEN = 0;

	let cachedTextEncoder = new TextEncoder('utf-8');

	const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
		? function (arg, view) {
			return cachedTextEncoder.encodeInto(arg, view);
		}
		: function (arg, view) {
			const buf = cachedTextEncoder.encode(arg);
			view.set(buf);
			return {
				read: arg.length,
				written: buf.length
			};
		});

	function passStringToWasm0(arg, malloc, realloc) {

		if (realloc === undefined) {
			const buf = cachedTextEncoder.encode(arg);
			const ptr = malloc(buf.length);
			getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
			WASM_VECTOR_LEN = buf.length;
			return ptr;
		}

		let len = arg.length;
		let ptr = malloc(len);

		const mem = getUint8Memory0();

		let offset = 0;

		for (; offset < len; offset++) {
			const code = arg.charCodeAt(offset);
			if (code > 0x7F) break;
			mem[ptr + offset] = code;
		}

		if (offset !== len) {
			if (offset !== 0) {
				arg = arg.slice(offset);
			}
			ptr = realloc(ptr, len, len = offset + arg.length * 3);
			const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
			const ret = encodeString(arg, view);

			offset += ret.written;
		}

		WASM_VECTOR_LEN = offset;
		return ptr;
	}

	let cachegetInt32Memory0 = null;
	function getInt32Memory0() {
		if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
			cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
		}
		return cachegetInt32Memory0;
	}

	const u32CvtShim = new Uint32Array(2);

	const int64CvtShim = new BigInt64Array(u32CvtShim.buffer);

	let cachegetUint32Memory0 = null;
	function getUint32Memory0() {
		if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
			cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
		}
		return cachegetUint32Memory0;
	}

	function getArrayJsValueFromWasm0(ptr, len) {
		const mem = getUint32Memory0();
		const slice = mem.subarray(ptr / 4, ptr / 4 + len);
		const result = [];
		for (let i = 0; i < slice.length; i++) {
			result.push(takeObject(slice[i]));
		}
		return result;
	}

	function handleError(f, args) {
		try {
			return f.apply(this, args);
		} catch (e) {
			wasm.__wbindgen_exn_store(addHeapObject(e));
		}
	}

	function getArrayU8FromWasm0(ptr, len) {
		return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
	}
	/**
	*/
	class Account {

		static __wrap(ptr) {
			const obj = Object.create(Account.prototype);
			obj.ptr = ptr;

			return obj;
		}

		__destroy_into_raw() {
			const ptr = this.ptr;
			this.ptr = 0;

			return ptr;
		}

		free() {
			const ptr = this.__destroy_into_raw();
			wasm.__wbg_account_free(ptr);
		}
		/**
		*/
		constructor() {
			var ret = wasm.account_new();
			console.log("constructor()")
			console.log({ ret });
			return Account.__wrap(ret);
		}
		/**
		* @param {string} private_key
		* @returns {Account}
		*/
		static from_private_key(private_key) {
			var ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.account_from_private_key(ptr0, len0);
			return Account.__wrap(ret);
		}
		/**
		* @returns {string}
		*/
		to_private_key() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.account_to_private_key(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		to_view_key() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.account_to_view_key(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		to_address() {
			try {
				console.log("to_address()");
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.account_to_address(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
	}
	/**
	*/
	class Ciphertext {

		static __wrap(ptr) {
			const obj = Object.create(Ciphertext.prototype);
			obj.ptr = ptr;

			return obj;
		}

		__destroy_into_raw() {
			const ptr = this.ptr;
			this.ptr = 0;

			return ptr;
		}

		free() {
			const ptr = this.__destroy_into_raw();
			wasm.__wbg_ciphertext_free(ptr);
		}
		/**
		* @param {string} ciphertext
		* @returns {Ciphertext}
		*/
		static from_string(ciphertext) {
			var ptr0 = passStringToWasm0(ciphertext, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.ciphertext_from_string(ptr0, len0);
			return Ciphertext.__wrap(ret);
		}
		/**
		* @param {string} account_view_key_string
		* @returns {boolean}
		*/
		is_owner(account_view_key_string) {
			var ptr0 = passStringToWasm0(account_view_key_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.ciphertext_is_owner(this.ptr, ptr0, len0);
			return ret !== 0;
		}
		/**
		* @param {string} decryption_key
		* @returns {string}
		*/
		to_plaintext(decryption_key) {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				var ptr0 = passStringToWasm0(decryption_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
				var len0 = WASM_VECTOR_LEN;
				wasm.ciphertext_to_plaintext(retptr, this.ptr, ptr0, len0);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var r2 = getInt32Memory0()[retptr / 4 + 2];
				var r3 = getInt32Memory0()[retptr / 4 + 3];
				var ptr1 = r0;
				var len1 = r1;
				if (r3) {
					ptr1 = 0; len1 = 0;
					throw takeObject(r2);
				}
				return getStringFromWasm0(ptr1, len1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(ptr1, len1);
			}
		}
		/**
		* @returns {string}
		*/
		to_string() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.ciphertext_to_string(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
	}
	/**
	*/
	class Record {

		static __wrap(ptr) {
			const obj = Object.create(Record.prototype);
			obj.ptr = ptr;

			return obj;
		}

		__destroy_into_raw() {
			const ptr = this.ptr;
			this.ptr = 0;

			return ptr;
		}

		free() {
			const ptr = this.__destroy_into_raw();
			wasm.__wbg_record_free(ptr);
		}
		/**
		* @param {string} record
		* @returns {Record}
		*/
		static from_string(record) {
			var ptr0 = passStringToWasm0(record, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.record_from_string(ptr0, len0);
			return Record.__wrap(ret);
		}
		/**
		* @param {string} decryption_key
		* @param {string} ciphertext
		* @returns {Record}
		*/
		static decrypt(decryption_key, ciphertext) {
			var ptr0 = passStringToWasm0(decryption_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ptr1 = passStringToWasm0(ciphertext, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len1 = WASM_VECTOR_LEN;
			var ret = wasm.record_decrypt(ptr0, len0, ptr1, len1);
			return Record.__wrap(ret);
		}
		/**
		* @returns {boolean}
		*/
		is_dummy() {
			var ret = wasm.record_is_dummy(this.ptr);
			return ret !== 0;
		}
		/**
		* @returns {string}
		*/
		owner() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_owner(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {BigInt}
		*/
		value() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_value(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				u32CvtShim[0] = r0;
				u32CvtShim[1] = r1;
				const n0 = int64CvtShim[0];
				return n0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {string}
		*/
		payload() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_payload(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		program_id() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_program_id(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		randomizer() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_randomizer(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		record_view_key() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_record_view_key(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		commitment() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_commitment(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		ciphertext() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_ciphertext(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		to_string() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.record_to_string(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
	}
	/**
	*/
	class Transaction {

		static __wrap(ptr) {
			const obj = Object.create(Transaction.prototype);
			obj.ptr = ptr;

			return obj;
		}

		__destroy_into_raw() {
			const ptr = this.ptr;
			this.ptr = 0;

			return ptr;
		}

		free() {
			const ptr = this.__destroy_into_raw();
			wasm.__wbg_transaction_free(ptr);
		}
		/**
		* @param {string} transaction
		* @returns {Transaction}
		*/
		static from_string(transaction) {
			var ptr0 = passStringToWasm0(transaction, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.transaction_from_string(ptr0, len0);
			return Transaction.__wrap(ret);
		}
		/**
		* @returns {string}
		*/
		to_string() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_to_string(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {boolean}
		*/
		is_valid() {
			var ret = wasm.transaction_is_valid(this.ptr);
			return ret !== 0;
		}
		/**
		* @param {string} transition_id
		* @returns {boolean}
		*/
		contains_transition_id(transition_id) {
			var ptr0 = passStringToWasm0(transition_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.transaction_contains_transition_id(this.ptr, ptr0, len0);
			return ret !== 0;
		}
		/**
		* @param {string} serial_number
		* @returns {boolean}
		*/
		contains_serial_number(serial_number) {
			var ptr0 = passStringToWasm0(serial_number, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.transaction_contains_serial_number(this.ptr, ptr0, len0);
			return ret !== 0;
		}
		/**
		* @param {string} commitment
		* @returns {boolean}
		*/
		contains_commitment(commitment) {
			var ptr0 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			var ret = wasm.transaction_contains_commitment(this.ptr, ptr0, len0);
			return ret !== 0;
		}
		/**
		* @returns {string}
		*/
		transaction_id() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_transaction_id(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		inner_circuit_id() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_inner_circuit_id(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {string}
		*/
		ledger_root() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_ledger_root(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {any[]}
		*/
		transition_ids() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_transition_ids(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {any[]}
		*/
		serial_numbers() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_serial_numbers(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {any[]}
		*/
		commitments() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_commitments(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {any[]}
		*/
		ciphertexts() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_ciphertexts(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {string}
		*/
		value_balance() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_value_balance(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				return getStringFromWasm0(r0, r1);
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
				wasm.__wbindgen_free(r0, r1);
			}
		}
		/**
		* @returns {any[]}
		*/
		events() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_events(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {any[]}
		*/
		transitions() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_transitions(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @param {string} view_key_string
		* @returns {any[]}
		*/
		to_decrypted_records(view_key_string) {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				var ptr0 = passStringToWasm0(view_key_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
				var len0 = WASM_VECTOR_LEN;
				wasm.transaction_to_decrypted_records(retptr, this.ptr, ptr0, len0);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v1;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
		/**
		* @returns {any[]}
		*/
		to_records() {
			try {
				const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
				wasm.transaction_to_records(retptr, this.ptr);
				var r0 = getInt32Memory0()[retptr / 4 + 0];
				var r1 = getInt32Memory0()[retptr / 4 + 1];
				var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
				wasm.__wbindgen_free(r0, r1 * 4);
				return v0;
			} finally {
				wasm.__wbindgen_add_to_stack_pointer(16);
			}
		}
	}

	async function load(module, imports) {
		if (typeof Response === 'function' && module instanceof Response) {
			if (typeof WebAssembly.instantiateStreaming === 'function') {
				try {
					return await WebAssembly.instantiateStreaming(module, imports);

				} catch (e) {
					if (module.headers.get('Content-Type') != 'application/wasm') {
						console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

					} else {
						throw e;
					}
				}
			}

			const bytes = await module.arrayBuffer();
			return await WebAssembly.instantiate(bytes, imports);

		} else {
			const instance = await WebAssembly.instantiate(module, imports);

			if (instance instanceof WebAssembly.Instance) {
				return { instance, module };

			} else {
				return instance;
			}
		}
	}

	async function init(input) {
		const imports = {};
		imports.wbg = {};
		imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
			console.log("__wbindgen_string_new");
			console.log({ arg0, arg1 });
			var ret = getStringFromWasm0(arg0, arg1);
			return addHeapObject(ret);
		};
		imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
			console.log(`__wbindgen_object_drop_ref`);
			console.log({ arg0 });
			takeObject(arg0);
		};
		imports.wbg.__wbg_new_693216e109162396 = function () {
			console.log("__wbg_new_693216e109162396");
			var ret = new Error();
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function (arg0, arg1) {
			console.log("__wbg_stack_0ddaca5d1abfb52f");
			console.log({ arg0, arg1 });
			var ret = getObject(arg1).stack;
			var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len0 = WASM_VECTOR_LEN;
			getInt32Memory0()[arg0 / 4 + 1] = len0;
			getInt32Memory0()[arg0 / 4 + 0] = ptr0;
		};
		imports.wbg.__wbg_error_09919627ac0992f5 = function (arg0, arg1) {
			console.log("__wbg_error_09919627ac0992f5");
			console.log({ arg0, arg1 });
			try {
				console.error(getStringFromWasm0(arg0, arg1));
			} finally {
				wasm.__wbindgen_free(arg0, arg1);
			}
		};
		imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
			// Here
			console.log("__wbindgen_object_clone_ref");
			console.log({ arg0 });
			var ret = getObject(arg0);
			console.log({ ret });
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_getRandomValues_3e46aa268da0fed1 = function () {
			console.log("__wbg_getRandomValues_3e46aa268da0fed1");
			return handleError(function (arg0, arg1) {
				getObject(arg0).getRandomValues(getObject(arg1));
			}, arguments)
		};
		imports.wbg.__wbg_randomFillSync_59fcc2add91fe7b3 = function () {
			console.log("__wbg_randomFillSync_59fcc2add91fe7b3");
			return handleError(function (arg0, arg1, arg2) {
				getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
			}, arguments)
		};
		imports.wbg.__wbg_process_f2b73829dbd321da = function (arg0) {
			console.log("__wbg_process_f2b73829dbd321da");
			console.log({ arg0 })
			console.log({ object_arg0: getObject(arg0) })
			var ret = getObject(arg0).process;
			return addHeapObject(ret);
		};
		imports.wbg.__wbindgen_is_object = function (arg0) {
			console.log("__wbindgen_is_object");
			console.log({ arg0 });
			const val = getObject(arg0);
			var ret = typeof (val) === 'object' && val !== null;
			return ret;
		};
		imports.wbg.__wbg_versions_cd82f79c98672a9f = function (arg0) {
			console.log("__wbg_versions_cd82f79c98672a9f");
			console.log({ arg0 });
			var ret = getObject(arg0).versions;
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_node_ee3f6da4130bd35f = function (arg0) {
			console.log("__wbg_node_ee3f6da4130bd35f");
			console.log({ arg0 });
			var ret = getObject(arg0).node;
			return addHeapObject(ret);
		};
		imports.wbg.__wbindgen_is_string = function (arg0) {
			console.log("__wbindgen_is_string");
			console.log({ arg0 });
			var ret = typeof (getObject(arg0)) === 'string';
			return ret;
		};
		imports.wbg.__wbg_modulerequire_0a83c0c31d12d2c7 = function () {
			console.log("__wbg_modulerequire_0a83c0c31d12d2c7");
			return handleError(function (arg0, arg1) {
				var ret = module.require(getStringFromWasm0(arg0, arg1));
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbg_crypto_9e3521ed42436d35 = function (arg0) {
			console.log("__wbg_crypto_9e3521ed42436d35");
			console.log({ arg0 });
			var ret = getObject(arg0).crypto;
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_msCrypto_c429c3f8f7a70bb5 = function (arg0) {
			console.log("__wbg_msCrypto_c429c3f8f7a70bb5");
			console.log({ arg0 });
			var ret = getObject(arg0).msCrypto;
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_newnoargs_f579424187aa1717 = function (arg0, arg1) {
			console.log("__wbg_newnoargs_f579424187aa1717");
			console.log({ arg0, arg1 });
			var ret = new Function(getStringFromWasm0(arg0, arg1));
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_call_89558c3e96703ca1 = function () {
			console.log("__wbg_call_89558c3e96703ca1");
			return handleError(function (arg0, arg1) {
				var ret = getObject(arg0).call(getObject(arg1));
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbg_self_e23d74ae45fb17d1 = function () {
			console.log("__wbg_self_e23d74ae45fb17d1");
			return handleError(function () {
				var ret = self.self;
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbg_window_b4be7f48b24ac56e = function () {
			console.log("__wbg_window_b4be7f48b24ac56e");
			return handleError(function () {
				var ret = window.window;
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbg_globalThis_d61b1f48a57191ae = function () {
			console.log("__wbg_globalThis_d61b1f48a57191ae");
			return handleError(function () {
				var ret = globalThis.globalThis;
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbg_global_e7669da72fd7f239 = function () {
			console.log("__wbg_global_e7669da72fd7f239");
			return handleError(function () {
				var ret = global$1.global;
				return addHeapObject(ret);
			}, arguments)
		};
		imports.wbg.__wbindgen_is_undefined = function (arg0) {
			console.log("__wbindgen_is_undefined");
			console.log({ arg0 });
			var ret = getObject(arg0) === undefined;
			return ret;
		};
		imports.wbg.__wbg_buffer_5e74a88a1424a2e0 = function (arg0) {
			console.log("__wbg_buffer_5e74a88a1424a2e0");
			console.log({ arg0 });
			var ret = getObject(arg0).buffer;
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_new_e3b800e570795b3c = function (arg0) {
			console.log("__wbg_new_e3b800e570795b3c");
			console.log({ arg0 });
			var ret = new Uint8Array(getObject(arg0));
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_set_5b8081e9d002f0df = function (arg0, arg1, arg2) {
			console.log("__wbg_set_5b8081e9d002f0df");
			console.log({ arg0, arg1, arg2 });
			getObject(arg0).set(getObject(arg1), arg2 >>> 0);
		};
		imports.wbg.__wbg_length_30803400a8f15c59 = function (arg0) {
			console.log("__wbg_length_30803400a8f15c59");
			console.log({ arg0 });
			var ret = getObject(arg0).length;
			return ret;
		};
		imports.wbg.__wbg_newwithlength_5f4ce114a24dfe1e = function (arg0) {
			console.log("__wbg_newwithlength_5f4ce114a24dfe1e");
			console.log({ arg0 });
			var ret = new Uint8Array(arg0 >>> 0);
			return addHeapObject(ret);
		};
		imports.wbg.__wbg_subarray_a68f835ca2af506f = function (arg0, arg1, arg2) {
			console.log("__wbg_subarray_a68f835ca2af506f");
			console.log({ arg0, arg1, arg2 });
			var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
			return addHeapObject(ret);
		};
		imports.wbg.__wbindgen_throw = function (arg0, arg1) {
			console.log("__wbindgen_throw");
			console.log({ arg0, arg1 });
			throw new Error(getStringFromWasm0(arg0, arg1));
		};
		imports.wbg.__wbindgen_memory = function () {
			console.log("__wbindgen_memory");
			var ret = wasm.memory;
			return addHeapObject(ret);
		};


		const { instance, module } = await load(input, imports);

		wasm = instance.exports;
		init.__wbindgen_wasm_module = module;

		console.log("wasm loaded");

		return wasm;
	}

	var aleo_wasm = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Account: Account,
		Ciphertext: Ciphertext,
		Record: Record,
		Transaction: Transaction,
		'default': init
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(aleo_wasm);

	const aleo = require$$0;

	var aleoWasmBundler = aleo;

	return aleoWasmBundler;

}));
