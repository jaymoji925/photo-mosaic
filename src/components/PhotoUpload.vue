<template>
  <div class="w-full">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">选择底图</h3>
      <div
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
        @click="triggerBaseImageUpload"
        @dragover.prevent
        @drop.prevent="handleBaseImageDrop"
      >
        <div v-if="!baseImage" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ImagePlus class="w-8 h-8 text-blue-500" />
          </div>
          <p class="text-gray-600">点击或拖拽底图到这里</p>
          <p class="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式</p>
        </div>
        <div v-else class="relative">
          <img :src="baseImage" class="max-h-48 mx-auto rounded-lg shadow-lg" />
          <button
            class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            @click.stop="clearBaseImage"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
      <input
        ref="baseImageInput"
        type="file"
        accept="image/jpeg,image/png"
        class="hidden"
        @change="handleBaseImageChange"
      />
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-gray-800">选择素材照片</h3>
        <span class="text-sm text-gray-500">{{ photos.length }}/100</span>
      </div>
      <div
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
        @click="triggerPhotoUpload"
        @dragover.prevent
        @drop.prevent="handlePhotoDrop"
      >
        <div v-if="photos.length === 0" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Images class="w-8 h-8 text-green-500" />
          </div>
          <p class="text-gray-600">点击或拖拽素材照片到这里</p>
          <p class="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式，最多100张</p>
        </div>
        <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          <div
            v-for="(photo, index) in photos"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img :src="photo" class="w-full h-full object-cover" />
            <button
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
              @click.stop="removePhoto(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div
            class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer"
            @click.stop="triggerPhotoUpload"
          >
            <Plus class="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
      <input
        ref="photoInput"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        class="hidden"
        @change="handlePhotoChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ImagePlus, Images, X, Plus } from 'lucide-vue-next'

const emit = defineEmits(['base-image-change', 'photos-change'])

const baseImageInput = ref(null)
const photoInput = ref(null)
const baseImage = ref('')
const photos = ref([])

const triggerBaseImageUpload = () => {
  baseImageInput.value?.click()
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handleBaseImageChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    loadImage(file).then(url => {
      baseImage.value = url
      emit('base-image-change', url)
    })
  }
}

const handleBaseImageDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    loadImage(file).then(url => {
      baseImage.value = url
      emit('base-image-change', url)
    })
  }
}

const clearBaseImage = () => {
  baseImage.value = ''
  emit('base-image-change', '')
}

const handlePhotoChange = (e) => {
  const files = Array.from(e.target.files || [])
  addPhotos(files)
}

const handlePhotoDrop = (e) => {
  const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'))
  addPhotos(files)
}

const addPhotos = (files) => {
  const remaining = 100 - photos.value.length
  const toAdd = files.slice(0, remaining)
  
  Promise.all(toAdd.map(loadImage)).then(urls => {
    photos.value = [...photos.value, ...urls]
    emit('photos-change', photos.value)
  })
}

const removePhoto = (index) => {
  photos.value.splice(index, 1)
  emit('photos-change', photos.value)
}

const loadImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}
</script>
