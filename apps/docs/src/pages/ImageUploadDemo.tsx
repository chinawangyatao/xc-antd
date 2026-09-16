import React from 'react';
import {
  Alert,
  Card,
  Col,
  message,
  Row,
  Typography,
} from 'antd';
import {
  ImageUpload,
  type ImageUploadFile,
  type ImageUploadRequestContext,
} from 'xc-antd';

interface DemoUploadResponse {
  name: string;
  url: string;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

function wait(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, duration);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('上传已取消', 'AbortError'));
    }, { once: true });
  });
}

export default function ImageUploadDemo() {
  const [bannerFiles, setBannerFiles] = React.useState<
    ImageUploadFile<DemoUploadResponse>[]
  >([]);
  const [avatarFiles, setAvatarFiles] = React.useState<
    ImageUploadFile<DemoUploadResponse>[]
  >([]);

  const mockUpload = React.useCallback(async (
    file: File,
    { signal, onProgress }: ImageUploadRequestContext,
  ): Promise<DemoUploadResponse> => {
    onProgress(20);
    await wait(300, signal);
    onProgress(70);
    const url = await readAsDataUrl(file);
    onProgress(100);
    return { name: file.name, url };
  }, []);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        ImageUpload
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        基于 Ant Design Upload 和 react-advanced-cropper，支持自由裁剪框、比例切换、缩放、旋转、批量裁剪与自定义上传。
      </Typography.Paragraph>
      <Alert
        showIcon
        type="info"
        message="选择本地图片即可测试；示例使用 Data URL 模拟上传，不会发送到服务器。"
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="自由裁剪与批量上传" style={{ height: '100%' }}>
            <Typography.Paragraph type="secondary">
              裁剪框可移动和拉伸，可切换 1:1、4:3、16:9 等比例，最多选择 4 张。
            </Typography.Paragraph>
            <ImageUpload<DemoUploadResponse>
              value={bannerFiles}
              onChange={setBannerFiles}
              multiple
              maxCount={4}
              maxSizeMB={8}
              customUpload={mockUpload}
              crop={{
                canMoveBox: true,
                movable: true,
                scalable: true,
                rotatable: true,
                quality: 0.9,
                format: 'jpeg',
                outputWidth: 1600,
              }}
              onUploadSuccess={(_, file) => {
                void message.success(`${file.name} 上传完成`);
              }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="头像圆形裁剪" style={{ height: '100%' }}>
            <Typography.Paragraph type="secondary">
              固定 1:1 圆形裁剪，输出 400 × 400 PNG，Canvas 会真正清除四角。
            </Typography.Paragraph>
            <ImageUpload<DemoUploadResponse>
              value={avatarFiles}
              onChange={setAvatarFiles}
              maxCount={1}
              maxSizeMB={5}
              listType="picture-circle"
              customUpload={mockUpload}
              crop={{
                aspectRatio: 1,
                shape: 'round',
                quality: 0.95,
                format: 'png',
                outputWidth: 400,
                outputHeight: 400,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
