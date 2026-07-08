<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
    <header class="bg-white shadow-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Grid3X3 class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">照片马赛克拼图</h1>
              <p class="text-sm text-gray-500">用照片拼出回忆</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Image class="w-4 h-4" />
            <span>将照片转化为艺术</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <PhotoUpload
            @base-image-change="handleBaseImageChange"
            @photos-change="handlePhotosChange"
          />

          <div class="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 class="text-sm font-medium text-gray-700 mb-3">参数设置</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">滤镜透明度</label>
                <input
                  type="range"
                  v-model="overlayOpacity"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>{{ Math.round(overlayOpacity * 100) }}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">拼图密度（生成的格子数量）</label>
                <input
                  type="range"
                  v-model="targetTileCount"
                  min="500"
                  max="5000"
                  step="100"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500</span>
                  <span>{{ targetTileCount }}</span>
                  <span>5000</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">提示：照片会自动重复填充，密度越高底图越清晰，建议1500-3000</p>
              </div>
            </div>
          </div>

          <button
            @click="generateMosaicImage"
            :disabled="!canGenerate || isGenerating"
            class="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isGenerating" class="w-5 h-5 animate-spin" />
            <Sparkles v-else class="w-5 h-5" />
            {{ isGenerating ? '生成中...' : '生成马赛克拼图' }}
          </button>

          <div v-if="!canGenerate" class="mt-3 text-center text-sm text-red-500">
            <AlertCircle class="w-4 h-4 inline mr-1" />
            {{ generateError }}
          </div>

          <div v-if="photos.length > 0" class="mt-3 text-center text-sm text-gray-500">
            <Info class="w-4 h-4 inline mr-1" />
            已上传 {{ photos.length }} 张照片，将自动扩展到 {{ targetTileCount }} 格
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">预览</h3>
            <button
              v-if="mosaicResult"
              @click="downloadResult"
              class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Download class="w-4 h-4" />
              下载图片
            </button>
          </div>

          <div class="relative bg-gray-100 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
            <div v-if="!mosaicResult && !baseImage" class="text-center">
              <ImageOff class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">上传底图和素材照片后生成预览</p>
            </div>

            <div v-else-if="!mosaicResult && baseImage" class="text-center">
              <img :src="baseImage" class="max-w-full max-h-[500px] rounded-lg shadow-lg" />
              <p class="text-gray-500 mt-4">点击"生成马赛克拼图"开始制作</p>
            </div>

            <img
              v-else
              :src="mosaicResult"
              class="max-w-full max-h-[600px] rounded-lg shadow-lg"
            />
          </div>

          <div v-if="mosaicResult" class="mt-4 p-4 bg-blue-50 rounded-xl">
            <h4 class="text-sm font-medium text-blue-800 mb-2">生成信息</h4>
            <div class="flex gap-4 text-sm text-blue-600">
              <span>网格: {{ gridInfo.cols }} × {{ gridInfo.rows }}</span>
              <span>总格子: {{ gridInfo.total }}</span>
            </div>
            <h4 class="text-sm font-medium text-blue-800 mt-3 mb-2">使用说明</h4>
            <ul class="text-sm text-blue-600 space-y-1">
              <li>• 远看呈现底图的色彩效果</li>
              <li>• 放大后可看到每张素材照片</li>
              <li>• 建议使用大色块、色彩分明的底图</li>
              <li>• 拼图密度越高，底图越清晰</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">功能特点</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Palette class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 class="font-medium text-gray-800">智能颜色匹配</h4>
              <p class="text-sm text-gray-500">自动提取底图颜色，为每张照片叠加对应滤镜</p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 class="font-medium text-gray-800">拖拽上传</h4>
              <p class="text-sm text-gray-500">支持拖拽批量上传照片，操作简单方便</p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 class="font-medium text-gray-800">智能网格</h4>
              <p class="text-sm text-gray-500">根据底图比例自动计算最优网格布局</p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
            <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download class="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h4 class="font-medium text-gray-800">高清导出</h4>
              <p class="text-sm text-gray-500">支持高清PNG格式下载，适合打印和分享</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-8 py-6 border-t border-gray-100 bg-white">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>照片马赛克拼图 - 用照片拼出美好回忆</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Grid3X3, Image, Sparkles, Loader2, Download,
  ImageOff, AlertCircle, Palette, Upload, Eye, Info
} from 'lucide-vue-next'
import PhotoUpload from './PhotoUpload.vue'
import { generateMosaic, downloadImage } from '../utils/imageProcessor'

const baseImage = ref('')
const photos = ref([])
const mosaicResult = ref('')
const isGenerating = ref(false)
const overlayOpacity = ref(0.6)
const targetTileCount = ref(1500)
const gridInfo = ref({ cols: 0, rows: 0, total: 0 })

const canGenerate = computed(() => {
  return baseImage.value && photos.value.length >= 5
})

const generateError = computed(() => {
  if (!baseImage.value && photos.value.length < 5) {
    return '请上传底图和至少5张素材照片'
  }
  if (!baseImage.value) {
    return '请上传底图'
  }
  return '请上传至少5张素材照片'
})

const handleBaseImageChange = (url) => {
  baseImage.value = url
}

const handlePhotosChange = (photoUrls) => {
  photos.value = photoUrls
}

const generateMosaicImage = async () => {
  if (!canGenerate.value) return

  isGenerating.value = true
  
  try {
    const result = await generateMosaic(baseImage.value, photos.value, {
      targetTileCount: targetTileCount.value,
      overlayOpacity: overlayOpacity.value
    })
    
    mosaicResult.value = result.dataUrl
    gridInfo.value = {
      cols: result.grid.cols,
      rows: result.grid.rows,
      total: result.actualTileCount
    }
  } catch (error) {
    console.error('生成失败:', error)
    alert('生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const downloadResult = () => {
  if (mosaicResult.value) {
    downloadImage(mosaicResult.value, `photo-mosaic-${Date.now()}.png`)
  }
}
</script>
