'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameSharePanelProps {
  roomCode: string;
  shareUrl: string;
}

export function GameSharePanel({ roomCode, shareUrl }: GameSharePanelProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const canUseNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(shareUrl, {
      width: 220,
      margin: 1,
    })
      .then((dataUrl) => {
        if (isActive) {
          setQrCodeUrl(dataUrl);
        }
      })
      .catch(() => {
        if (isActive) {
          setQrCodeUrl(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [shareUrl]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('failed');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const shareGame = async () => {
    if (!canUseNativeShare) {
      await copyShareLink();
      return;
    }

    try {
      await navigator.share({
        title: 'Join my quiz game',
        text: `Join with room code ${roomCode}`,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      await copyShareLink();
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Share Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">Room Code</div>
          <div className="mt-2 font-mono text-3xl font-bold tracking-[0.35em] text-gray-900">
            {roomCode}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Players can type this code or scan the QR code
          </div>
        </div>

        {qrCodeUrl && (
          <div className="flex justify-center">
            <Image
              src={qrCodeUrl}
              alt={`QR code for room ${roomCode}`}
              width={224}
              height={224}
              unoptimized
              className="h-56 w-56 rounded-lg border border-gray-200 bg-white p-3"
            />
          </div>
        )}

        <div className="grid gap-2 md:grid-cols-2">
          <Button onClick={shareGame}>{canUseNativeShare ? 'Share' : 'Copy Link'}</Button>
          <Button variant="outline" onClick={copyShareLink}>
            {copyStatus === 'copied'
              ? 'Copied'
              : copyStatus === 'failed'
                ? 'Copy Failed'
                : 'Copy Link'}
          </Button>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600 break-all">
          {shareUrl}
        </div>
      </CardContent>
    </Card>
  );
}
