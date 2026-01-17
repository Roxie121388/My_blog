import { NextResponse, NextRequest } from "next/server";
import * as qiniu from "qiniu";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filename, expiredSeconds = 3600 } = body;

  // 从环境读取七牛云配置
  const qiniuAccessKey = process.env.QINIU_ACCESS_KEY;
  const qiniuSecretKey = process.env.QINIU_SECRET_KEY;
  const qiniuBucket = process.env.QINIU_BUCKET;
  const qiniuDomain = process.env.QINIU_DOMAIN;

  console.log(qiniuAccessKey, qiniuSecretKey, qiniuBucket, qiniuDomain);

  // 校验必填项
  if (
    !filename ||
    !qiniuAccessKey ||
    !qiniuSecretKey ||
    !qiniuBucket ||
    !qiniuDomain
  ) {
    return NextResponse.json({ error: "缺少必要配置" }, { status: 400 });
  }

  const mac = new qiniu.auth.digest.Mac(qiniuAccessKey, qiniuSecretKey);

  // 配置上传策略
  const options = {
    scope: filename ? `${qiniuBucket}:${filename}` : qiniuBucket,
    expires: expiredSeconds,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
  };

  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const key = filename || `${Date.now()}.${filename.split(".").pop()}`;

  return NextResponse.json({
    key,
    token: uploadToken,
    domain: qiniuDomain,
    uploadUrl: "https://up-z0.qiniup.com",
  });
}
