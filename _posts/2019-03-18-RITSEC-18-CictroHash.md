---
title:  RITSEC Crypto 18 - CictroHash
author: Razzk
date: '2019-03-18 14:10:00 +0800'
categories:
  - Cryptography Engineering 
  - RITSEC-CTF
tags:
  - Cryptography
  - Pyhton
  - RITSEC-Cryptography Engineering
published: true
comments: true
math: true
pin: false
---

## Inroduction

>  RITSEC CTF 2018 - CictroHash 

## Description

For this challenge you must implement the described Hash Function and then find a collision of two strings.
Once a collision is found send both strings to fun.ritsec.club:8003 as a HTTP POST request like below:

curl -X POST http://fun.ritsec.club:8003/checkCollision \
--header "Content-Type: application/json" \
--data '{"str1": "", "str2": ""}'
If the strings are a valid collision then the flag will be returned.

NOTE: requests to this server are being rate-limited for obvious reasons.

Author: Cictrone

## Writeup

This crypto challenge was really original and very interesting.

We started writing the implementation for the CictroHash sponge function, after some ranting for the incomplete specification and the incorrect text vector.
Then we based our output on the hashes returned by the server.

Once our implementation was exact, we noticed that the permutation function only acted on some bits and didn’t provide enough [diffusion](https://en.wikipedia.org/wiki/Confusion_and_diffusion) so the [avalanche effect](https://en.wikipedia.org/wiki/Avalanche_effect) was minimum in some cases.

For example you can see how “HELLOWORLD” and “HELLOWORLD0” only differs by 2 bit in the 3rd byte

```cpp
>>> CictroHash.hash("HELLOWORLD")
"91f1c05e"
>>> CictroHash.hash("HELLOWORLD0")
"91f1005e"
>>>
>>> '{:08b}'.format(0x00)
'00000000'
>>> '{:08b}'.format(0xc0)
'11000000'
```
## CictroHash Script
```python
class CictroHash:
	def __init__(self):
		self.initialize_state()

	def initialize_state(self):
		self.S = [[31, 56, 156, 167], [38, 240, 174, 248]]

	def r(self):
		return self.S[0]

	def c(self):
		return self.S[1]

	def hash(self, text):
		text = self.pad(self.prepare(text))
		blocks = [text[i:i + 4] for i in range(0, len(text), 4)]
		for b in blocks:
			self.absorb(b)
		return self.squeeze()

	def pad(self, t):
		t.extend([0] * (4 - len(t) % 4))
		return t

	def prepare(self, text):
		return [ord(i) for i in text]

	def absorb(self, P):
		self.S[0] = self.xor(P, self.S[0])
		for i in range(50):
			self.round()

	def squeeze(self):
		return ''.join(['{:02x}'.format(b) for b in self.S[0]])

	def xor(self, a, b):
		return [c ^ p for c, p in zip(a, b)]

	def round(self):
		self.alfa()
		self.beta()
		self.gamma()
		self.delta()
		return self.S

	def alfa(self):
		self.S[0], self.S[1] = self.S[1], self.S[0]

	def beta(self):
		for i in range(0, len(self.S[1])):
			self.S[0][i] ^= self.S[1][len(self.S[1]) - 1 - i]

	def gamma(self):
		S1 = [
			[self.S[1][3], self.S[1][0], self.S[1][2], self.S[0][0]],
			[self.S[1][1], self.S[0][3], self.S[0][1], self.S[0][2]]
		]
		self.S = S1

	def delta(self):
		self.S[0][0] = self.rol(self.S[0][0])
		self.S[1][0] = self.rol(self.S[1][0])
		self.S[0][2] = self.rol(self.S[0][2])
		self.S[1][2] = self.rol(self.S[1][2])

		self.S[0][1] = self.ror(self.S[0][1])
		self.S[1][1] = self.ror(self.S[1][1])
		self.S[0][3] = self.ror(self.S[0][3])
		self.S[1][3] = self.ror(self.S[1][3])

	def rol(self, c):
		return ((c << 1) | (c >> 7)) & 0xff

	def ror(self, c):
		return ((c >> 1) | (c << 7)) & 0xff


# Testing
for w in [
	("HELLOWORLD", "91f1c05e"),
	("HELLOWORLD0", "91f1005e"),
]:
	h = CictroHash()
	assert(h.hash(w[0]) == w[1])

# "Differential" analysis
XOR = [0b00000001, 0b00000010, 0b00001000, 0b00010000, 0b00100000, 0b01000000, 0b10000000]
seed = ["H", "E", "L", "L", "O", "W", "O", "R", "L", "D"]
found = {}

for x in XOR:
	for i in range(len(seed)):
		tmp = seed.copy()
		h = CictroHash()
		tmp[i] = chr(ord(seed[i]) ^ x)
		chash = h.hash("".join(tmp))
		if found.get(chash):
			print(chash, found[chash], "".join(tmp))
			exit()
		found[chash] = "".join(tmp)  
```
Bitflip one bit at a time the pre-image searching for a collision
```python
91f1405e - HENLOWORLD - HELLOWGRLD
```

