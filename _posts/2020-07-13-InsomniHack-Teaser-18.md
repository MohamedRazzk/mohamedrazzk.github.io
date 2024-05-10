---
title:  InsomniHackTeaser Crypto 18 - Rule86
author: Razzk
date: '2020-07-13 14:10:00 +0800'
categories:
  - Cryptography Engineering 
tags:
  - Cryptography
  - Pyhton
  - InsomniHackTeaser-Cryptography Engineering
published: true
comments: true
math: true
pin: false
---

## Inroduction

>  InsomniHack Teaser CTF 2018 - Rule86 

## Description

Kevin is working on a new synchronous stream cipher, but he has been re-using his key.

In this challenge, you are provided with 4 files:

```
hint.gif.enc          - An encrypted GIF
super_cipher.py.enc   - An encrypted python script
rule86.txt            - A cleartext file 
rule86.txt.enc        - The encrypted version of said file
```

## Writeup

Step 1
we started by getting the keystream from the `rule86.txt` file and its encrypted counterpart
```python 
p1 = open('rule86.txt', 'rb').read()
c1 = open('rule86.txt.enc', 'rb').read()

keystream = []
for a, b in zip(p1, c1):
    keystream.append(a ^ b)
```
And then, decrypting the other encrypted files

```python
c2 = open('super_cipher.py.enc', 'rb').read()
p2 = []

for a, b in zip(keystream, c2):
    p2.append(a ^ b)

print(bytes(p2))
```
Since the `rule86.txt.enc` file is smaller then `super_cipher.py.enc` and `hint.gif.enc` we don’t have enough keystream to decrypt the latters.

Step 2

We noticed that the decrypted script was generating a 32-byte integer with a PRNG from the `key` (aka the flag) and using that as keystream.

```cpp
RULE = [86 >> i & 1 for i in range(8)]
N_BYTES = 32
N = 8 * N_BYTES

def next(x):
  x = (x & 1) << N+1 | x << 1 | x >> N-1
  y = 0
  for i in range(N):
    y |= RULE[(x >> i) & 7] << i
  return y

# Bootstrap the PNRG
keystream = int.from_bytes(args.key.encode(),'little')
for i in range(N//2):
  keystream = next(keystream)
```
The simple way to solve this and decrypt the gif and the script was to retrive the starting 32-byte integer from the known keystream and then using the PRNG function to reproduce the keystream by generating all the integer we wanted.

![upload-image](/assets/img/sample/gif.png)

So I’ve made a recreate script part of the gif following this pattern.

```python
#!/usr/bin/python3

l1=[b'\x00', b'\x2b', b'\x55', b'\x80', b'\xaa', b'\xd5', b'\xff']
l2=[b'\x00', b'\x33', b'\x66', b'\x99', b'\xcc', b'\xff']

header = b'\x47\x49\x46\x38\x39\x61\x67\x02\xE6\x00\xF7\x00\x00'

ary = b'' + header
for i in l2:
    for j in l1:
        for k in l2:
            ary += i + j + k

gne = open('hint_full.gif', 'wb')
gne.write(ary)
gne.close()

# l1 l2 l1 l1 l2 l1 l1 l2 l1 l1 l2 l1 l1 l2 l1 l1 l2 l1
# 00 00 00 00 00 33 00 00 66 00 00 99 00 00 CC 00 00 FF
# 00 2B 00 00 2B 33 00 2B 66 00 2B 99 00 2B CC 00 2B FF
# 00 55 00 00 55 33 00 55 66 00 55 99 00 55 CC 00 55 FF
```

All went smooth and without problem so I kept thinking it was the good approach, beside that the gif was corrupted, but the keystream was right and we decrypted all the script

![upload-image](/assets/img/sample/hint.gif)

Script for recovering the super_cipher.py file

```python
#!/usr/bin/python3

p1 = open('rule86.txt', 'rb').read()
c1 = open('rule86.txt.enc', 'rb').read()
c2 = open('super_cipher.py.enc', 'rb').read()
c3 = open('hint.gif.enc', 'rb').read()

# get the first part of the keystream
keystream = []
for a, b in zip(p1, c1):
  keystream.append(a ^ b)

# decrypt the gif file
p3 = []
for a, b in zip(keystream, c3):
  p3.append(a ^ b)
    
with open('hint2.gif', 'wb') as f:
  f.write(bytes(p3))

# run giffer.py to generate hint_full.gif

# get another keystream part
keystream = []
gif = open('hint_full.gif', 'rb').read()
for a, b in zip(c3, gif):
  keystream.append(a ^ b)

# decrypt the full python script
p2 = []
for a, b in zip(keystream, c2):
  p2.append(a ^ b)
print(bytes(p2).decode())
    
with open('super_cipher1.py', 'w') as f:
  f.write(bytes(p2).decode())
```

Step 3
Now we know that the flag is the seed of the PRNG used as encryption keystream.
We only need to reverse it and get the previous number for each step. Easy.

Let’s start from this line.
`x = (x & 1) << N+1 | x << 1 | x >> N-1`

`(x & 1)` get the lsb from `x` (our starting number)
`(x & 1) << N+1` will shift it 257 positions left (N = 256)

if `x` lsb is 0, `(x & 1) << N+1` will be `0`
if `x` lsb is 1. `(x & 1) << N+1` will be `1 << 257`

`x << 1` shift `x` by 1 position to the left

`x >> N-1` will take the 2 msb, shift them by 255 positions right and OR them as lsb

Turns out this is very easy to reverse and also the output number has its 2 msb equals to its 2 lsb.

The reverse operation is the following: `x = (x >> 1) & ((1 << N)-1)`

`x >> 1` shift `x` by 1 position right, eliminating the 2 lsb added above.

The AND operation filters the first operand’s bits where the second operand has bits set to 1. 
`(1 << N)` is `0b1000000` with N zeros. Minus one will result in `0b111111` with N ones.

We are effectively filtering only the N bits we wanted, eliminating the 2 msb added above.

Then the PRNG takes 3 bits at a time from the right and substitute them by the RULE array.

```cpp
for i in range(N):
    y |= RULE[(x >> i) & 7] << i
```
For example if we have `0b1100`, the for works like this:

```python
y[0] = RULE[0b100] # 0bXXX100
y[1] = RULE[0b110] # 0bXX110X 
y[2] = RULE[0b11]  # 0bX011XX
y[3] = RULE[0b1]   # 0b001XXX
y = y[::-1]        # reverse y 

```
Output y will be `0b1011`

Reversing this is pretty easy too, just scan y and get the possible preimage values of RULE mapping function that result in either 1 or 0.
If the current y bit is 1, check what value in RULE output 1 and check if that value is consistent with the previous ones (since chosen bits form x are overlapping)

To recovery  the integer keystream

```python
import sys

RULE = [86 >> i & 1 for i in range(8)]
N_BYTES = 32
N = 8 * N_BYTES

def next(x):
  x = (x & 1) << N+1 | x << 1 | x >> N-1
  y = 0
  for i in range(N):
    y |= RULE[(x >> i) & 7] << i
  return y

p = open('rule86.txt','rb')
c = open('rule86.txt.enc','rb')

plaintext = p.read(N_BYTES)
ciphertext = c.read(N_BYTES)

# print the full keystream
while plaintext:
  x = int.from_bytes(plaintext,'little') ^ int.from_bytes(ciphertext,'little')
  print(x)
  plaintext = p.read(N_BYTES)
  ciphertext = c.read(N_BYTES)
```

For reverseing the PRNG and get the seed/flag

```python
RULE = [86 >> i & 1 for i in range(8)]
N_BYTES = 32
N = 8 * N_BYTES

def next(x,n=N):
  x = (x & 1) << N+1 | x << 1 | x >> N-1
  y = 0
  for i in range(N):
    y |= RULE[(x >> i) & 7] << i
  return y


def reverse(y):
  valid = []                            # declare a valid array since the preimage of a value according
                                        # to the rule can be the result of 4 different input
  
  ycell = y & 0b1                       # get the last bit
  for j in range(len(RULE)):            # for every rule 
    if RULE[j] == ycell:                # check if the result match our expected value
      valid.append(j)                   # add the value as valid
  
  for i in range(1, N):                 # for every bit in y (should be 256/258 bit)
    newvalid = []
    for v in valid:                     # for every previous valid value
      ycell = (y >> i) & 0b1            # get the y target cell (1 bit)
      xcell = (v >> i) & 0b011          # get the x target cell (2 bit out of 3) from the previous valid
      for j in range(len(RULE)):        
        if RULE[j] == ycell:
          if (j & 0b011) == xcell:      # check if the result match our target one
            v |= (j << i)               # "add" our match to the already valid one
            newvalid.append(v)          # update the valid list
    valid = newvalid

  x = None
  for v in valid:                       # for every valid 256 bit value
    if (v >> 256) == (v & 0b11):        # check if the 2 msb are equals to the 2 lsb
      x = v                             # we found our previous x 

  if x is None:
    print("Error no valid integer!")
    exit(1)
          
  x = (x >> 1) & ((1 << N)-1)           # fix our x accordingly
  return x


#values from the keystream
l = [37450399269036614778703305999225837723915454186067915626747458322635448226786,
100622653914913501834016856771730649612864879431221716975620828032766397709367,
30565965598786057661696410930164890805958057693583615925316094177133280560720,
103573567656710023306192266386049368645675636074643938780342918703636500548568,
28509515191943075455625810763252620824333983857860790449437105502768741406797,
87537284303558144156631836069957764733725337398790274426598731583572530580725,
44716782229954850790645591045965014941901610454109696374926338641251779999508,
82447195088123999846117257332504341489187184956851468679950679621555020370358,
66901809945344917781374326984783824023739095925450107364519045210557505092242,
114067135427233025222698564170101622975443616062287263643297019211756836637438,
2884516673931260333907001189797696957250433333677043264446344069828816140802,
5289872070696193140037770894656341630909797897334877860267293814493245082375,
69023781971677661808035522723190242410127104903614192265146189107040377117065,
107613775284599791185420266567845597101440592435618453390961765397563059875550,
16357066489843479901612193664610011889060446509506296924636891723597443981890,
57186523063755103597333412726627151956381596060761612487300750841069890516967]


# try to reverse the keystream
for i in range(len(l)-1,0,-1):
  next(l[i-1])
  a = reverse(l[i])

  if a != l[i-1]:
    print('Error in keystream')
    exit()
  print('OK ---',i)
  
print("YOU ROCK! Keystream reversed.\nReversing 128 bootstrap rounds...")

# after this you should go 128 block reverse and get the PRNG seed aka FLAG
curr = l[1]
for i in range(0,129):
  curr = reverse(curr)

print("128 rounds done.\nPrinting flag...\n")
print(curr.to_bytes(N_BYTES,'little').decode())
```
` Flag is Captured ` >> `INS{Rule86_is_W0lfr4m_Cha0s}`












