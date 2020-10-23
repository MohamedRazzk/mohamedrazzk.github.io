---
title:  TAMU Crypto 18 - LarryCrypt
author: Razzk
date: '2019-01-12 14:10:00 +0800'
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

>  TAMU CTF 2018 - LarryCrypt 

## Description

A binary executable called larrycrypt was provided.

./larrycrypt -R 4 -K "V3c70R" flag

## Writeup

We tried some input for the `larrycrypt` binary and we noticed that it was always using `Mu` as key, no matter what was the `-K` parameter.
It was likely some bug, but then the [SimpleDES challenge](https://razzk.net/posts/TAMU-18-SimpleDES/)  we just solved came to our minds.

The binary was using the same key as the other challenge’s example.
So we thought it was using the same algorithm, but it wasn’t the case.

Larrycrypt was using 6bit blocks for the ciphertext.
The first block of ciphertext was the same as SimpleDES’s first 6bit of cyphertext when using the same key and the same number of rounds. With some more reverse engineering we figured out that larrycrypt was taking the first 12 bits of plaintext, splitting them into `L0` and `R0`, performing the round function and printing only the resulting `L1`.
So they were using the same round function.

But then the sequence changes, we take the `R` output from the round function and use it as `L` for the next round along with the next block of ciphertext.

This image shows an example on 3 blocks of data, the output cypertext is made of `cypher0`, `cypher1`. `L2` won’t be printed


![upload-image](/assets/img/sample/upload-image.png)

To decrypt this we need to bruteforce all the possible 6bit last blocks (`L2` in the image), decrypt all the blocks and check if the plaintext is good use the previous des pyhton script and the bruteforce the plain text 

## Scripts 
  
```python
import simple_des

class SimplerDES(simple_des.SimpleDES):
    def encrypt(self, data):
        if len(data[0]) == 8:
            data = simple_des.to_twelve(data)
        result = []
        for block in data:
            a,b = self.split_block(block)
            result.extend([a,b])
        data = result
        result = []
        self.schedule_key(len(data))
        Lr = data[0]
        for i in range(0,len(data)-1):
            Rr = data[i+1]
            for r in range(self.rounds):
                sk = self.subkeys[i][r]
                Lr, Rr = self.round(sk, Lr, Rr)
            result.append(Lr)
            Lr = Rr
        return result
    
    def decrypt(self, data, last):
        self.invert_key(len(data))
        result = []
        Lr = last
        for i in range(len(data),0,-1):
            i -=1 # hotfix
            Rr = data[i]
            for r in range(self.rounds):
                sk = self.subkeys[i][r]
                Lr, Rr = self.round(sk, Lr, Rr)
            result.append(Lr)
            Lr = Rr
        result.reverse()
        return result


import itertools

#fi = open('flags.txt','w')

ciphertext = ['000101','000000','100111','011001','101110','011101','001110','101111','010001','101111','110000','001001','110010','111011','110111','010001','000100','101011','100010','100010','000001','010100','001111','010010','111110','001110','000111']
key = simple_des.ascii_to_bin("Mu")

f = SimplerDES(key, rounds=4)

for i in itertools.product('01', repeat=6):
    decrypted = f.decrypt(ciphertext, ''.join(i))
    l = ''.join(decrypted)
    #fi.write(l+'\n')
    if simple_des.bin_to_ascii(l[-8:]) == '}':
        l = '010001'+l # fix the starting G  :D
        print(simple_des.bin_to_ascii(l))
    
#fi.close()    
```


