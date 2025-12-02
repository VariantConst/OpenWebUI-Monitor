# 使用 Node.js 官方镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    netcat-openbsd \
    postgresql-client

# 全局安装 pnpm
RUN npm install -g pnpm --registry=https://registry.npmmirror.com

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --no-frozen-lockfile --registry=https://registry.npmmirror.com

# 复制项目文件
COPY . .

# 修复 Windows line endings 并添加执行权限
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 使用启动脚本
CMD ["./start.sh"] 