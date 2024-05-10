---
title:  Reverse Engineering - Cloak and Dagger
author: Razzk
date: '2018-06-01 14:10:00 +0800'
categories:
  - Reverse Engineering 
  - CT-CTF
tags:
  - C++
  - CT-Reverse Engineering
published: true
comments: true
math: true
pin: false
---

## Inroduction

> Cyber Talents - Cloak and dagger reverse engineering ahram canadian competition. 

## Description

Dot net binary file given as excutable file called cloak and dagger with description of " Open The right file to get the flag " Reverse it to get the flag 

## File

 For downloading excutable file , Visit  [Cloak And Dagger.exe ](https://github.com/MohamedRazzk/mohamedrazzk.github.io/blob/master/_posts/Data/Cloak%20and%20Dagger.exe).
 
## Solution

The file is .NET binary (you may use Detect It Easy to determine the type of a binary)
On running it, it just lets you select a file and makes a messagebox with You have the wrong file!
So let's load it to dnSpy
At the decompiled class form1 there are two methods

```cpp
public static string HexStr(byte[] p)
		{
			char[] array = new char[p.Length * 2 + 2];
			array[0] = '0';
			array[1] = 'x';
			int i = 0;
			int num = 2;
			while (i < p.Length)
			{
				byte b = (byte)(p[i] >> 4);
				array[num] = (char)((b > 9) ? (b + 55) : (b + 48));
				b = (byte)(p[i] & 15);
				array[++num] = (char)((b > 9) ? (b + 55) : (b + 48));
				i++;
				num++;
			}
			return new string(array);
		}
```

Which just converts a byte array into hex value 'a' ---> '0x61' (you can use https://dotnetfiddle.net/ or the interactive c# plugin at dnSpy to test c# code snippets)
Also we have

```cpp
private void button1_Click(object sender, EventArgs e)
		{
			if (this.openFileDialog1.ShowDialog() == DialogResult.OK)
			{
				string fileName = this.openFileDialog1.FileName;
				try
				{
					string b = "FF0003060C1204121212000100C40307";
					BinaryReader binaryReader = new BinaryReader(new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.None));
					binaryReader.BaseStream.Position = 0L;
					byte[] p = binaryReader.ReadBytes(256);
					binaryReader.Close();
					string a = string.Concat(new string[]
					{
						Form1.HexStr(p).Substring(2, 2),
						Form1.HexStr(p).Substring(34, 2),
						Form1.HexStr(p).Substring(66, 2),
						Form1.HexStr(p).Substring(98, 2),
						Form1.HexStr(p).Substring(130, 2),
						Form1.HexStr(p).Substring(162, 2),
						Form1.HexStr(p).Substring(194, 2),
						Form1.HexStr(p).Substring(226, 2),
						Form1.HexStr(p).Substring(258, 2),
						Form1.HexStr(p).Substring(290, 2),
						Form1.HexStr(p).Substring(322, 2),
						Form1.HexStr(p).Substring(354, 2),
						Form1.HexStr(p).Substring(386, 2),
						Form1.HexStr(p).Substring(418, 2),
						Form1.HexStr(p).Substring(450, 2),
						Form1.HexStr(p).Substring(482, 2)
					});
					string str = string.Concat(new string[]
					{
						Form1.HexStr(p).Substring(4, 2),
						Form1.HexStr(p).Substring(36, 2),
						Form1.HexStr(p).Substring(68, 2),
						Form1.HexStr(p).Substring(100, 2),
						Form1.HexStr(p).Substring(132, 2),
						Form1.HexStr(p).Substring(164, 2),
						Form1.HexStr(p).Substring(196, 2),
						Form1.HexStr(p).Substring(228, 2),
						Form1.HexStr(p).Substring(260, 2),
						Form1.HexStr(p).Substring(292, 2),
						Form1.HexStr(p).Substring(324, 2),
						Form1.HexStr(p).Substring(356, 2),
						Form1.HexStr(p).Substring(388, 2),
						Form1.HexStr(p).Substring(420, 2),
						Form1.HexStr(p).Substring(452, 2),
						Form1.HexStr(p).Substring(484, 2)
					});
					if (a == b)
					{
						MessageBox.Show("Flag is: " + str);
					}
					else
					{
						MessageBox.Show("You have the wrong file!");
					}
				}
				catch (IOException)
				{
				}
			}
		}
```
Which does this:

1. Open a new file with OpenFileDialog component and read it into byte array p
2. Define a string b with value `FF0003060C1204121212000100C40307`
3. Define a string a with the concatenation of hex values of bytes at offsets` {0,16,32,48,64,80,96,112,128,144,160,176,192,208,224,240}` (remember that `HexStr` returns `0x` at the start of the hex string and every byte has a corresponding 2-chars hex string)

4. Also defines another string `str` like a but at different offsets
Makes a check if array string a equals string b and if true it will print the flag to be string `str<>`

We can deduce some things here; first it will crash if opened a file with size < 242 bytes (484 / 2)
Second, our target here is to open the right file nothing else
Once I understood that, I knew that the right file is somehow embedded in the binary
I used binwalk to extract any embedded or appended files with this command ` binwalk --dd=".*" "Cloak and Dagger.exe"`
The extracted files are so many, so we cannot just open them one by one to get the write file
Rather than that I will loop through all files reading them and check for the bytes at the previous indices array to be equal to the hex array `FF0003060C1204121212000100C40307`

I used this simple script to achieve it

```cpp
>>> from os import listdir
>>> from os.path import isfile, join
>>> onlyfiles = [f for f in listdir(".") if isfile(join(".", f))]
>>> for file in onlyfiles:
...     data = open(file,'rb').read()
...     if data[0] == '\xFF' and data[16] == '\x00' and data[32] == '\x03' and data[48] == '\x06' and data[64] == '\x0C' and data[80] == '\x12' and data[96] == '\x04' and data[112] == '\x12' and data[128] == '\x12' and data[144] == '\x12' and data[160] == '\x00' and data[176] == '\x01' and data[192] == '\x00' and data[208] == '\xC4' and data[224] == '\x03' and data[240] == '\x07':
...         print(file)
...
7F4428
```

So we have the right file `7F4428`, open it with our program to get the flag

` Flag is Captured ` >> `D80103060B120712121211FF00000512`
