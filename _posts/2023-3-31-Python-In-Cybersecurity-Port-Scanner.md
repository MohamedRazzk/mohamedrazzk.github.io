---
title: Python in Cybersecurity - Port Scanner
author: Razzk
date: 2023-03-31 11:33:00 +0800
categories: [Python in Cybersecurity]
tags: [cybersecuriy, python, port Scanner]
math: true
mermaid: true
---




## Description

How to write adavanced port scanner in python

## Video

{% include embed/youtube.html id='g81-lm0fNE8' %}


## Code
```python
import socket
import re
from termcolor import colored
import optparse
from threading import *



def portscanner(host, port):
    try:
        socket.setdefaulttimeout(5)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        if sock.connect_ex((host,port)):
            print(colored("port %d closed" % port,'red'))
        else:
            print(colored("port %d open" % port, 'green' ))

    except Exception as error:
        print(error)



def portScan (host,ports):
     for port in ports:
         if 0 < int(port) < 65353:
            Th =Thread(target=portscanner,args=(host,int(port)))
            Th.start()
         else:
            print('%d is not valid' % port)



def main():
    parser = optparse.OptionParser('for scan -t <host ip> -p <host port > ')
    parser.add_option('-t',dest='targethost', type= 'string', help='type target host')
    parser.add_option('-p',dest='targetport', type= 'string', help='ports , seperated')
    (options, args) =parser.parse_args()
    target_host = options.targethost
    target_port = str(options.targetport).split(',')

    if (target_host is None) | (target_port[0] is None):
        print(parser.usage)
        exit(0)
    else:
        validIP = re.match(r"\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b", target_host)

        if bool(validIP):
            portScan(target_host,target_port)
        else:
            print('check the ip')



if __name__ == '__main__':
    main()



# while True:
#
#     try:
#         sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
#         host = input("enter the host: ")
#         port = int(input("enter the port:  "))
#
#         validIP = re.match(r"\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b",host)
#         validport = True if 0 < port < 65535 else False
#
#
#         if bool(validIP) and validport:
#             portScan(host,port)
#         else:
#             print('check port or ip is valid')
#
#
#         sock.close()
#
#     except Exception as error:
#         print(error)
```

