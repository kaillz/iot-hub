import asyncio
import json
import random
import argparse
from datetime import datetime

import websockets

WS_SERVER_URL = 'ws://localhost:8080'


def build_payload(device_id: int) -> dict:
    raw_light = random.randint(200, 900)
    return {
        'device_id': f'device_{device_id}',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'light_raw': raw_light,
        'lux': max(0, min(1000, int((950 - raw_light) * 0.12))),
        'temperature': round(random.uniform(20.0, 26.0), 1),
        'humidity': round(random.uniform(35.0, 55.0), 1),
    }


async def emulate_device(device_id: int, interval: float, duration: float):
    async with websockets.connect(WS_SERVER_URL) as ws:
        print(f'[{device_id}] connected')

        async def receive_loop():
            try:
                async for message in ws:
                    print(f'[{device_id}] received: {message}')
            except websockets.ConnectionClosed:
                print(f'[{device_id}] connection closed')

        receiver = asyncio.create_task(receive_loop())

        start = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start < duration:
            payload = build_payload(device_id)
            await ws.send(json.dumps(payload))
            print(f'[{device_id}] sent: {payload}')
            await asyncio.sleep(interval)

        receiver.cancel()
        try:
            await receiver
        except asyncio.CancelledError:
            pass


async def run_emulator(count: int, interval: float, duration: float):
    tasks = [asyncio.create_task(emulate_device(i + 1, interval, duration)) for i in range(count)]
    await asyncio.gather(*tasks)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='WebSocket device emulator for smart-home backend')
    parser.add_argument('--count', type=int, default=5, help='Number of virtual devices')
    parser.add_argument('--interval', type=float, default=2.0, help='Send interval in seconds')
    parser.add_argument('--duration', type=float, default=600.0, help='Run duration in seconds')
    args = parser.parse_args()

    print(f'Starting {args.count} virtual devices, interval={args.interval}s, duration={args.duration}s')
    asyncio.run(run_emulator(args.count, args.interval, args.duration))
