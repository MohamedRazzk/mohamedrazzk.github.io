---
title:  Python in Cybersecurity - Advanced Port Scanner - Scan & Defense In Depth 
author: Razzk
date: 2023-04-16 11:33:00 +0800
categories: [Python in Cybersecurity]
tags: [cybersecuriy, python, port Scanner]
math: true
mermaid: true
comments: true

---




## Description

Advanced Port Scanner - Scan & Defense In Depth All type of tcp scans, banner graping, udp scans, craft tcp packet, thread pool

## Video

{% include embed/youtube.html id='tyQFX2YhCjQ' %}


## Code
```python
from scapy.layers.inet import IP,TCP,ICMP,UDP
from scapy.volatile import RandShort
from scapy.sendrecv import sr1
import array
import socket
import re
from termcolor import colored
import argparse
import concurrent.futures
import time
import struct

threadNumber = 1
sleepTime = 0

class TCPPacket :

    def __init__(self,
                 srcip: str,
                 srcport: int,
                 dstip: str,
                 dstport: int,
                 flags: int = 0,
                 window:int = 1024):

        self.srcport = srcport
        self.destport = dstport
        self.flags = flags
        self.window = window
        self.srcip = srcip
        self.dstip = dstip



    def chksum(self,packet:bytes) -> int:

        if len(packet) % 2 != 0:
            packet += b'\0'
        res = sum(array.array('H',packet))
        res = (res>>16) + (res & 0xffff)
        res += res >> 16
        return (~res) & 0xffff

    def tcppak(self) -> bytes:

        packet = struct.pack(
            '!HHIIBBHHH',
            self.srcport,
            self.destport,
            0,
            0,
            0b01010000,
            self.flags,
            self.window,
            0,
            0
        )

        temheader = struct.pack(
            '!4s4sBBH',
            socket.inet_aton(self.srcip),
            socket.inet_aton(self.dstip),
            0,
            socket.IPPROTO_TCP,
            len(packet)
        )

        chksum = self.chksum(temheader+packet)
        packet = packet[:16] + struct.pack('H',chksum) + packet[18:]

        return packet


def tcpscan(host, port):
    try:
        socket.setdefaulttimeout(5)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        if sock.connect_ex((host,port)):
            return colored("port %d closed" % port,'red')
        else:
           return colored("port %d open" % port, 'green' )

    except Exception as error:
        print(error)


def tcpcraft(host,port):
    socket.setdefaulttimeout(1)
    sock = socket.socket(socket.AF_INET,socket.SOCK_RAW,socket.IPPROTO_TCP)
    packet = TCPPacket(
        '192.168.1.12',
        5656,
        host,
        port,
        0b1111111,     #0b0010100
        0
    )
    sock.sendto(packet.tcppak(),(host,port))
    response = sock.recv(1024)
    ipheader = struct.unpack('!2sH8s4s4s',response[0:20])
    # print(ipheader)
    # sourceip = socket.inet_ntoa(ipheader[3])
    # destip = socket.inet_ntoa(ipheader[4])
    # print(sourceip,destip)
    tcpheader = struct.unpack('!HHIIBBHHH',response[20:40])
    # print("unpacked tcp header ", tcpheader)
    #print("flags " ,tcpheader[5])

    if response and tcpheader[0]==port :
        if tcpheader[5] == 18:
            return f"{port} is open "
        elif tcpheader[5]== 20 :
            return f"{port} is closed"
    else:
        return f"{port} filtered"


def nullscan(host,port):
    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'RA':
                return f"{port} is closed"
            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is filtered"
    else:
        service = socket.getservbyport(port)
        return f"{port}  is open|filtered | {service}"


def synscan(host,port):
    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='S')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'SA':
                return f"{port} is Open"
            elif recvpack[TCP].flags == 'RA':
                return f"{port} is Closed"
    else:
        return f"{port} filtered "


def ackscan(host,port):

    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='A')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'R':
                return f"{port} is UnFiltered"
            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is Filtered"
    else:
        return f"{port} is Filtered "


def windowscan(host,port):

    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='A')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'R' and recvpack[TCP].window > 0 :
                return f"{port} is Open"

            elif recvpack[TCP].flags == 'R' and recvpack[TCP].window == 0:
                return f"{port} is Closed"

            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is Filtered"
    else:
        return f"{port} is Filtered "


def finscan(host,port):

    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='F')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'RA':
                return f"{port} is Closed"
            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is Filtered"
    else:
        return f"{port} is Open|Filtered "


def xmasscan(host,port):

    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='FPU')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'RA':
                return f"{port} is Closed"
            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is Filtered"
    else:
        return f"{port} is Open|Filtered "


def maimonscan(host,port):

    packet = IP(dst=host)/TCP(sport=RandShort(),dport=port,flags='FA')
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(TCP):
            if recvpack[TCP].flags == 'R':
                return f"{port} is Closed"
            elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,3,9,10,13]:
                return f"{port} is Filtered"
    else:
        return f"{port} is Open|Filtered "


def udpscan(host,port):

    packet = IP(dst=host)/UDP(sport=RandShort(),dport=port)
    recvpack=sr1(packet,timeout=1,verbose=False)

    if recvpack:
        if recvpack.haslayer(UDP):
            return f"{port} Is Open"

        elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) == 3:
            return f"{port} is Closed"

        elif int(recvpack[ICMP].type) == 3 and int(recvpack[ICMP].code) in [1,2,9,10,13]:
            return f"{port} is Filtered"
    else:
        return f"{port} is Open|Filtered "

def findbanner(host,port):
    try:
        socket.setdefaulttimeout(1)
        sock = socket.socket()
        sock.connect((host,port))
        banner = sock.recv(4000)
        if banner:
            return f"{port} Banner is :{banner} "
        else:
            return f"{port} Banner Not Defined "
    except Exception as err:
        return f"Filed to get panner on {port} : ERR : {err}"



def portScan (host,ports,scantype):

    with concurrent.futures.ThreadPoolExecutor(max_workers=threadNumber) as executer:
        portExDict = {executer.submit(scantype,host,int(port)):port for port in ports}

        for result in concurrent.futures.as_completed(portExDict):
            try:
                data = result.result()
            except Exception as exc:
                print(exc)
            else:
                print(data)
                time.sleep(sleepTime)

     # for port in ports:
     #     if 0 < int(port) < 65353:
     #        Th =Thread(target=portscanner,args=(host,int(port)))
     #        Th.start()
     #     else:
     #        print('%d is not valid' % port)



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-t',dest='targethost', type= str, help='type target host')
    parser.add_argument('-p',dest='targetport', type= str, help='ports , seperated')
    parser.add_argument('-th',dest='threadnumber', type= int, help='thread number')
    parser.add_argument('-sl','--sleep', type= int, help='ports , seperated')
    parser.add_argument('-tc', '--tcp', action ="store_true", help='full tcp scan')
    parser.add_argument('-ct', '--craft', action ="store_true", help='craft tcp scan ')
    parser.add_argument('-n', '--null', action ="store_true", help='Null Scan')
    parser.add_argument('-s', '--syn', action ="store_true", help='syn Scan')
    parser.add_argument('-a', '--ack', action ="store_true", help='ack Scan')
    parser.add_argument('-w', '--window', action ="store_true", help='window Scan')
    parser.add_argument('-f', '--fin', action ="store_true", help='Fin Scan')
    parser.add_argument('-x', '--xmas', action ="store_true", help='Xmas Scan')
    parser.add_argument('-m', '--maimon', action ="store_true", help='maimon Scan')
    parser.add_argument('-u', '--udp', action ="store_true", help='UDP Scan')
    parser.add_argument('-b', '--banner', action ="store_true", help='Banner Scan')


    args = parser.parse_args()

    target_host = args.targethost
    threadnumber = args.threadnumber
    target_port = str(args.targetport).split(',')



    if (target_host is None) | (target_port[0] is None):
        parser.print_usage()
        exit(0)
    else:
        if args.threadnumber:
            global threadNumber
            threadNumber = threadnumber

        if args.sleep:
            global sleepTime
            sleepTime = args.sleep

        validIP = re.match(r"\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b", target_host)

        if bool(validIP):
            if args.tcp:
                print("------------ Full TCP Scan ------------- ")
                portScan(target_host,target_port,tcpscan)

            if args.craft:
                print("------------ Craft TCP Scan ------------- ")
                portScan(target_host,target_port,tcpcraft)

            if args.null:
                print("------------ Null TCP Scan ------------- ")
                portScan(target_host,target_port,nullscan)

            if args.syn:
                print("------------ Syn TCP Scan ------------- ")
                portScan(target_host,target_port,synscan)

            if args.ack:
                print("------------ ACK TCP Scan ------------- ")
                portScan(target_host, target_port, ackscan)

            if args.window:
                print("------------ ACK TCP Scan ------------- ")
                portScan(target_host, target_port, windowscan)

            if args.fin:
                print("------------ Fin TCP Scan ------------- ")
                portScan(target_host, target_port, finscan)

            if args.xmas:
                print("------------ Xmas TCP Scan ------------- ")
                portScan(target_host, target_port, xmasscan)

            if args.maimon:
                print("------------ Maimom TCP Scan ------------- ")
                portScan(target_host, target_port, maimonscan)

            if args.udp:
                print("------------ UDP Scan ------------- ")
                portScan(target_host, target_port, udpscan)

            if args.banner:
                print("------------ Banner Scan ------------- ")
                portScan(target_host, target_port, findbanner)

        else:
            print('check the ip')



if __name__ == '__main__':
    main()
```

