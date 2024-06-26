---
title:  TAMU Crypto 18 - SimpleDES
author: Razzk
date: '2018-12-06 14:10:00 +0800'
categories:
  - Cryptography Engineering 
  - TAMU-CTF
tags:
  - Cryptography
  - Pyhton
  - TAMU-Cryptography Engineering
published: true
comments: true
math: true
pin: false
---

## Inroduction

>  TAMU CTF 2018 - SimpleDES 

## Description

Larry is working on an encryption algorithm based on DES. He hasn’t worked out all the kinks yet, but he thinks it works. Your job is to confirm that you can decrypt a message, given the algorithm and parameters used.

The organizer gave us a specification about this simpleDES cipher:

```
 His system works as follows:
    - Choose a plaintext that is divisible into 12bit 'blocks'
    - Choose a key at least 8bits in length
    - For each block from i=0 while i<N perform the following operations
    - Repeat the following operations on block i, from r=0 while r<R
    - Divide the block into 2 6bit sections Lr,Rr
    - Using Rr, "expand" the value from 6bits to 8bits.
    Do this by remapping the values using their index, e.g.
    1 2 3 4 5 6 -> 1 2 4 3 4 3 5 6
    - XOR the result of this with 8bits of the Key beginning with Key[iR+r] and wrapping back to the beginning if necessary.
    - Divide the result into 2 4bit sections S1, S2
    - Calculate the 2 3bit values using the two "S boxes" below, using S1 and S2 as input respectively.

    S1  0   1   2   3   4   5   6   7
    0 101 010 001 110 011 100 111 000
    1 001 100 110 010 000 111 101 011

    S2  0   1   2   3   4   5   6   7
    0 100 000 110 101 111 001 011 010
    1 101 011 000 111 110 010 001 100

    - Concatenate the results of the S-boxes into 1 6bit value
    - XOR the result with Lr
    - Use Rr as Lr and your altered Rr (result of previous step) as Rr for any further computation on block i
    - increment r
```
The problem is the following:

```
He has encryped a message using Key="Mu", and R=2.
See if you can decipher it into plaintext.

Submit your result to Larry in the format Gigem{plaintext}.

Binary of ciphertext: 01100101 00100010 10001100 01011000 00010001 10000101

```

## Writeup

While we started reading the implementation for this cipher we noticed that it was based on a Feistel network

A Feistel network is a scheme that lets you construct a block cipher efficently since it requires only a round function (that doesn’t need to be invertible) and it only involves XOR operations.

The decryption is pretty straightforward. Referring to the simpleDES implementation above:
On step 3, for every block before starting the rounds iteration, swap L with R. Then at the end of the R rounds, swap L and R again.

You also need to reverse the key schedule for round iteration.
Let’s assume you have 1 block and 3 rounds.

For the encryption you use the keys `K0`, `K1` and `K2`. For the decryption you will need to use `K2`, `K1` and `K0`.

Why?
Immagine you start from 1 block of plaintext. You split it into 2 blocks L0 and R0.
Now you use `K0` and `R0` on the round function `F`.
This function will spit out “garbage” `Z` that you XOR with `L0`. You can now use the result as `R1` and use `R0` as `L1`.

For the decryption you only need to XOR the “garbage” Z again with R1

```
R1 = L0 ⊕ Z
R1 ⊕ Z = L0 ⊕ Z ⊕ Z = L
```
## Scripts 
###  Implemented Simple DES script

```python
#!/usr/bin/env python

def to_twelve(data):
    try:
        div = len(data) * len(data[0]) % 12
    except:
        raise Exception("wrongly formatted text")
        
    if div != 0:
        raise Exception("text not divisible by 12")
        
    split = int(len(data[0]) * 1/2)
    twelve = []
    for i in range(0, int(len(data)/3)):
        index = i*3
        twelve.append(data[index+0] + data[index+1][:split])
        twelve.append(data[index+1][split:] + data[index+2])
    return twelve

def twelve_to_eight(data):
    split = 8
    eight = []
    for i in range(0, int(len(data)/2)):
        index = i*2
        eight.append(data[index+0][:split])
        eight.append(data[index+0][split:]+data[index+1][:(split/2)])
        eight.append(data[index+1][(split/2):])
    return eight

def ascii_to_bin(data):
    return ['{:08b}'.format(ord(c)) for c in data]

def bin_to_ascii(data):
    t = []
    for bit in range(0,len(data),8):
        t.append(chr(int(data[bit:bit+8],2)))
    return ''.join(t)


class SimpleDES(object):
    rounds = 2
    
    sbox1 = [['101','010','001','110','011','100','111','000'], 
             ['001','100','110','010','000','111','101','011']]
    sbox2 = [['100','000','110','101','111','001','011','010'],
             ['101','011','000','111','110','010','001','100']]
    
    def __init__(self, key, rounds=rounds):
        self.key = ''.join(key)
        self.rounds = rounds
        
    def split_block(self, data):
        split = int(len(data) * 1/2)
        d1 = data[:split]
        d2 = data[split:]
        return d1, d2

    def schedule_key(self, n):
        self.subkeys = []
        for i in range(n):
            k = []
            for r in range(self.rounds):
                kr = "" 
                for h in range(0,8):
                    index = i*self.rounds+r + h
                    kr += self.key[index%len(self.key)]
                k.append(kr)
            self.subkeys.append(k)

    def invert_key(self, n):
        self.schedule_key(n)
        for i in range(n):
            k = self.subkeys[i]
            k.reverse()
            self.subkeys[i] = k
        
    def crypt(self, data, decrypt=False):
        result = []
        i = 0
        for block in data:
            Lr, Rr = self.split_block(block)
            if decrypt:
                Lr, Rr = Rr, Lr
            for r in range(self.rounds):
                sk = self.subkeys[i][r]
                Lr, Rr = self.round(sk, Lr, Rr)
            if decrypt:
                Lr, Rr = Rr, Lr
            result.append(Lr+Rr)
            i+=1
        print(result)
        return twelve_to_eight(result)
    
    def encrypt(self, data):
        data = to_twelve(data)
        self.schedule_key(len(data))
        return self.crypt(data)
        
    def decrypt(self, data):
        data = to_twelve(data)
        self.invert_key(len(data))
        return self.crypt(data,True)

    def round(self, subkey, L, R):
        Lr = R
        R = self.expand(R)
        R = self.xor(R, subkey)
        R1, R2 = self.split_block(R)
        R1 = self.substitute(self.sbox1, R1)
        R2 = self.substitute(self.sbox2, R2)
        R = R1 + R2
        Rr = self.xor(R, L)
        return Lr, Rr
    
    def xor(self, d1, d2):
        if len(d1) != len(d2):
            raise Exception("different length string when xoring")
        l = [str(int(a) ^ int(b)) for a,b in zip(d1,d2)]
        return ''.join(l)
    
    def expand(self, R):
        return R[0]+R[1]+R[3]+R[2]+R[3]+R[2]+R[4]+R[5]
        
    def substitute(self, sbox, block):
        msb = int(block[0])
        index = int(block[1:],2)
        return sbox[msb][index]
```

### Got the flag script 

```python 
#!/usr/bin/env python

import simple_des

ciphertext = ['01100101', '00100010', '10001100', '01011000', '00010001', '10000101']
key = simple_des.ascii_to_bin("Mu")

f = simple_des.SimpleDES(key)

flag = simple_des.bin_to_ascii(''.join(f.decrypt(ciphertext)))
print("Gigem{" + ''.join(flag) + "}")

```

