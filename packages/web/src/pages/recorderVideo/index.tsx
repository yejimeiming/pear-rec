import { AVCanvas, AudioSprite, ImgSprite, TextSprite, VideoSprite } from '@webav/av-canvas';
import { AVRecorder } from '@webav/av-recorder';
import { mp4StreamToOPFSFile } from '@webav/av-cliper';
import { Button, Card, Divider, Modal, message, Flex } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import { useApi } from '../../api';
import { useUserApi } from '../../api/user';
import { useTranslation } from 'react-i18next';
import initApp from '../main';

let avCvs: AVCanvas | null = null;
let recorder: AVRecorder | null = null;

function initCvs(attchEl: HTMLDivElement | null) {
  if (attchEl == null) return;
  avCvs = new AVCanvas(attchEl, {
    bgColor: '#333',
    resolution: {
      width: 1920,
      height: 1080,
    },
  });
}

export default function UI() {
  const { t } = useTranslation();
  const api = useApi();
  const userApi = useUserApi();
  const [user, setUser] = useState({} as any);
  const outputStream = useRef<any>();
  const [stateText, setStateText] = useState('');

  useEffect(() => {
    user.id || getCurrentUser();
    return () => {
      avCvs?.destroy();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (outputStream.current == null) return;
      const opfsFile = await mp4StreamToOPFSFile(outputStream.current);
      window.isOffline ? saveAs(opfsFile, `pear-rec_${+new Date()}.mp4`) : saveFile(opfsFile);
    })();
  }, [outputStream.current]);

  async function getCurrentUser() {
    const res = (await userApi.getCurrentUser()) as any;
    if (res.code == 0) {
      const user = res.data;
      setUser(user);
    }
  }

  async function saveFile(blob) {
    try {
      const formData = new FormData();
      formData.append('type', 'rv');
      formData.append('userId', user.id);
      formData.append('file', blob);
      const res = (await api.saveFile(formData)) as any;
      if (res.code == 0) {
        if (window.isElectron) {
          window.electronAPI.sendRvCloseWin();
          window.electronAPI.sendVvOpenWin({ videoUrl: res.data.filePath });
        } else {
          Modal.confirm({
            title: '录屏已保存，是否查看？',
            content: `${res.data.filePath}`,
            okText: t('modal.ok'),
            cancelText: t('modal.cancel'),
            onOk() {
              window.open(`/viewVideo.html?videoUrl=${res.data.filePath}`);
            },
          });
        }
      }
    } catch (err) {
      message.error('保存失败');
    }
  }

  async function start() {
    if (avCvs == null) return;
    recorder = new AVRecorder(avCvs.captureStream(), {
      width: 1920,
      height: 1080,
      bitrate: 5e6,
      audioCodec: 'aac',
    });
    await recorder.start();
    outputStream.current = recorder.outputStream;
    setStateText('录制中...');
  }

  return (
    <Card>
      <Flex gap="small" wrap="wrap">
        添加素材：
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            const vs = new VideoSprite('userMedia', mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
          }}
        >
          摄像 & 麦克风
        </Button>
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true,
            });
            const vs = new VideoSprite('display', mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
          }}
        >
          屏幕
        </Button>
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const is = new ImgSprite(
              'img',
              await loadFile({ 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] }),
            );
            await avCvs.spriteManager.addSprite(is);
          }}
        >
          图片
        </Button>
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const vs = new VideoSprite('video', await loadFile({ 'video/*': ['.webm', '.mp4'] }), {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
          }}
        >
          视频
        </Button>
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const as = new AudioSprite(
              'audio',
              await loadFile({ 'audio/*': ['.mp3', '.wav', '.ogg'] }),
              { audioCtx: avCvs.spriteManager.audioCtx },
            );
            await avCvs.spriteManager.addSprite(as);
          }}
        >
          音频
        </Button>
        <Button
          onClick={async () => {
            if (avCvs == null) return;
            const fs = new TextSprite('text', '示例文字');
            await avCvs.spriteManager.addSprite(fs);
          }}
        >
          文字
        </Button>
      </Flex>
      <Divider />
      <Flex gap="small" wrap="wrap">
        <Button
          onClick={async () => {
            await start();
          }}
        >
          开始录制
        </Button>
        <Button
          onClick={async () => {
            await recorder?.stop();
            setStateText('视频已保存');
          }}
        >
          停止录制
        </Button>
        <span style={{ marginLeft: 16, color: '#666' }}>{stateText}</span>
      </Flex>
      <div
        ref={initCvs}
        style={{ width: 900, height: 500, position: 'relative', marginTop: 20 }}
      ></div>
    </Card>
  );
}

async function loadFile(accept: Record<string, string[]>) {
  const [fileHandle] = await (window as any).showOpenFilePicker({
    types: [{ accept }],
  });
  return await fileHandle.getFile();
}

initApp(UI);
