<template>
  <div>
      <Navigation />
      <div class="container mt-6 mx-auto px-6 py-8">
          <!-- Heading -->
          <div class="flex justify-between items-center">
              <h1 class="data-gedung-text text-3xl font-black text-black">
                  Daftar Gedung Mess
              </h1>
              <button @click="openAddGuesthouseModal" class="data-gedung-text font-bold bg-blue-500 text-white px-5 py-2 text-sm rounded-lg hover-gradient">
                  Tambah Gedung Mess
              </button>
              <!-- Review Photo Slideshow Modal -->
              <transition name="modal">
                  <div v-if="showReviewSlideshow" class="photo-slideshow fixed inset-0 flex items-center justify-center z-50">
                      <!-- Overlay hitam sebagai background -->
                      <div class="absolute inset-0 bg-black bg-opacity-75"></div>
                      
                      <!-- Container utama dengan tombol close di luar container foto -->
                      <div class="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col">
                          <!-- Tombol Close - di pojok kanan atas, tidak terikat pada foto -->
                          <button 
                              @click="showReviewSlideshow = false" 
                              class="absolute top-4 right-4 z-30 bg-black bg-opacity-50 text-white hover:text-gray-200 p-2 rounded-full"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                          </button>
                          
                          <!-- Container untuk foto yang dibatasi ukurannya -->
                          <div class="flex-1 flex items-center justify-center mt-8 mb-12 overflow-hidden">
                              <img 
                                  :src="selectedReview?.review_media[currentReviewSlideIndex]?.url" 
                                  :alt="'Foto ulasan dari ' + selectedReview?.rent.renter.fullname" 
                                  class="max-w-full max-h-full object-contain"
                              >
                          </div>
                          
                          <!-- Navigasi dan counter foto -->
                          <div class="flex justify-between items-center w-full px-4">
                              <!-- Previous Button -->
                              <button 
                                  @click="prevReviewSlide" 
                                  class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                  :disabled="currentReviewSlideIndex === 0"
                                  :class="{'opacity-50 cursor-not-allowed': currentReviewSlideIndex === 0}"
                              >
                                  ◀
                              </button>
                              
                              <!-- Counter foto -->
                              <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-20">
                                  {{ currentReviewSlideIndex + 1 }} / {{ selectedReview?.review_media.length }}
                              </div>
                              
                              <!-- Next Button -->
                              <button 
                                  @click="nextReviewSlide" 
                                  class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                  :disabled="currentReviewSlideIndex === (selectedReview?.review_media.length - 1)"
                                  :class="{'opacity-50 cursor-not-allowed': currentReviewSlideIndex === (selectedReview?.review_media.length - 1)}"
                              >
                                  ▶
                              </button>
                          </div>
                      </div>
                  </div>
              </transition>
          </div>

          <!-- Skeleton Loader -->
          <div v-if="isLoading" class="cardbox-gedung mt-6 bg-blue-100 p-6 shadow-lg flex relative rounded-xl">
              <!-- Image placeholder -->
              <div class="skeleton w-48 h-32 rounded-lg"></div>
              
              <!-- Content placeholders -->
              <div class="flex-1 pl-4">
                  <div class="skeleton h-7 w-3/4 mb-2"></div>
                  <div class="skeleton h-5 w-1/2 mb-2"></div>
                  <div class="skeleton h-6 w-1/3 mt-3"></div>
              </div>
              
              <!-- Rating -->
              <div class="rating absolute top-4 right-4 flex items-center space-x-1">
                  <div class="skeleton h-5 w-5 mr-1 rounded-full"></div>
                  <div class="skeleton h-6 w-10 rounded"></div>
              </div>
              
              <!-- Actions -->
              <div class="absolute bottom-4 right-4 flex space-x-3">
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
              </div>
          </div>
          <div v-if="isLoading" class="cardbox-gedung mt-6 bg-blue-100 p-6 shadow-lg flex relative rounded-xl">
              <!-- Image placeholder -->
              <div class="skeleton w-48 h-32 rounded-lg"></div>
              
              <!-- Content placeholders -->
              <div class="flex-1 pl-4">
                  <div class="skeleton h-7 w-3/4 mb-2"></div>
                  <div class="skeleton h-5 w-1/2 mb-2"></div>
                  <div class="skeleton h-6 w-1/3 mt-3"></div>
              </div>
              
              <!-- Rating -->
              <div class="rating absolute top-4 right-4 flex items-center space-x-1">
                  <div class="skeleton h-5 w-5 mr-1 rounded-full"></div>
                  <div class="skeleton h-6 w-10 rounded"></div>
              </div>
              
              <!-- Actions -->
              <div class="absolute bottom-4 right-4 flex space-x-3">
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
                  <div class="skeleton w-24 h-10 rounded-lg"></div>
              </div>
          </div>

          <!-- Tampilan jika tidak ada gedung -->
          <div v-else-if="guesthouses.length === 0" class="mt-6 p-8 bg-blue-100 rounded-xl text-center">
              <p class="text-lg text-gray-700">Belum ada data ruang mess. Silakan tambahkan ruang mess baru.</p>
          </div>

          <!-- Loop semua gedung mess yang tersedia -->
          <div v-else class="space-y-6 mt-6">
              <div 
                  v-for="guesthouse in guesthouses" 
                  :key="guesthouse.id" 
                  class="cardbox-gedung bg-blue-100 p-6 shadow-lg flex relative rounded-xl"
              >
                  <!-- Gambar Gedung -->
                  <img 
                      :src="guesthouse.guesthouse_media && guesthouse.guesthouse_media.length > 0 
                          ? guesthouse.guesthouse_media[0]?.url 
                          : 'https://via.placeholder.com/150'"
                      :alt="guesthouse.name"
                      class="w-48 h-32 object-cover rounded-lg"
                  />

                  <!-- Detail Gedung -->
                  <div class="flex-1 pl-4">
                    <h2 class="nama-gedung text-xl font-black text-black mb-1">{{ guesthouse.name }}</h2>
                    <p class="text-black mb-7">{{ guesthouse.address }}</p>
                  </div>

                  <!-- Rating -->
                  <!-- <div class="rating absolute top-4 right-4 flex items-center space-x-1">
                      <img src="@/assets/star.png" alt="Rating" class="w-5 h-5 mr-1" />
                      <span class="text-gray-700 text-base font-semibold">8.1</span>
                  </div> -->

                  <!-- Actions -->
                  <div class="absolute bottom-4 right-4 flex space-x-3">
                      <button @click="showGuesthouseDetail(guesthouse.id)" class="action-button bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1 hover-action-button">
                          <img src="@/assets/detail.png" alt="Detail" class="w-5 h-5" />
                          <span>Detail</span>
                      </button>
                      <button @click="openEditGuesthouseModal(guesthouse)" class="action-button bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1 hover-action-button">
                          <img src="@/assets/edit.png" alt="Edit" class="w-5 h-5" />
                          <span>Edit</span>
                      </button>
                      <button @click="deleteGuesthouse(guesthouse.id)" class="action-button bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1 hover-action-button" :disabled="isDeletingGuesthouse">
                        <template v-if="isDeletingGuesthouse && guesthouse.id === deletingGuesthouseId">
                            <svg class="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Menghapus...</span>
                        </template>
                        <template v-else>
                            <img src="@/assets/delete.png" alt="Hapus" class="w-5 h-5" />
                            <span>Hapus</span>
                        </template>
                        <!-- <img src="@/assets/delete.png" alt="Hapus" class="w-5 h-5" />
                          <span>Hapus</span> -->
                      </button>
                  </div>
              </div>
          </div>
      </div>

       <!-- Add Guesthouse Modal -->
       <transition name="modal">
              <div v-if="showAddGuesthouseModal" class="detail-modal fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                  <div class="detail-modal-cardbox w-4/5 max-w-4xl rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
                      <!-- Close button -->
                      <button @click="closeAddGuesthouseModal" class="absolute top-4 right-4 text-gray-700 hover:text-gray-900">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                      
                      <!-- Modal title -->
                    <h2 class="text-2xl text-black font-bold data-gedung-text mb-6 text-center">Tambah Gedung Mess</h2>
                      
                      <!-- Form steps indicator -->
                      <div class="flex justify-center mb-6">
                          <div class="w-1/2 flex items-center">
                              <div :class="[
                                  'w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2',
                                  formStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                              ]">1</div>
                              <div class="flex-grow h-1" :class="formStep === 1 ? 'bg-blue-500' : 'bg-gray-300'"></div>
                              <div :class="[
                                  'w-8 h-8 rounded-full flex items-center justify-center font-bold ml-2',
                                  formStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                              ]">2</div>
                          </div>
                      </div>

                      <!-- Add Guesthouse Form Photo Slideshow Modal -->
                        <transition name="modal">
                            <div v-if="showAddGuesthouseSlideshow" class="photo-slideshow fixed inset-0 flex items-center justify-center z-50">
                                <!-- Overlay hitam sebagai background -->
                                <div class="absolute inset-0 bg-black bg-opacity-75"></div>
                                
                                <!-- Container utama dengan tombol close di luar container foto -->
                                <div class="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col">
                                    <!-- Tombol Close -->
                                    <button 
                                        @click="showAddGuesthouseSlideshow = false" 
                                        class="absolute top-4 right-4 z-30 bg-black bg-opacity-50 text-white hover:text-gray-200 p-2 rounded-full"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    
                                    <!-- Container untuk foto -->
                                    <div class="flex-1 flex items-center justify-center mt-8 mb-12 overflow-hidden">
                                        <img 
                                            :src="guesthousePhotoPreviews[currentAddGuesthouseSlideIndex]" 
                                            alt="Preview foto gedung mess" 
                                            class="max-w-full max-h-full object-contain"
                                        >
                                    </div>
                                    
                                    <!-- Navigasi dan counter foto -->
                                    <div class="flex justify-between items-center w-full px-4">
                                        <!-- Previous Button -->
                                        <button 
                                            @click="prevAddGuesthouseSlide" 
                                            class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                            :disabled="currentAddGuesthouseSlideIndex === 0"
                                            :class="{'opacity-50 cursor-not-allowed': currentAddGuesthouseSlideIndex === 0}"
                                        >
                                            ◀
                                        </button>
                                        
                                        <!-- Counter foto -->
                                        <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-20">
                                            {{ currentAddGuesthouseSlideIndex + 1 }} / {{ guesthousePhotoPreviews.length }}
                                        </div>
                                        
                                        <!-- Next Button -->
                                        <button 
                                            @click="nextAddGuesthouseSlide" 
                                            class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                            :disabled="currentAddGuesthouseSlideIndex === (guesthousePhotoPreviews.length - 1)"
                                            :class="{'opacity-50 cursor-not-allowed': currentAddGuesthouseSlideIndex === (guesthousePhotoPreviews.length - 1)}"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>    

                        <!-- Edit Guesthouse Form Photoslide Modal -->
                        <transition name="modal">
                            <div v-if="showAddRoomSlideshow" class="photo-slideshow fixed inset-0 flex items-center justify-center z-50">
                                <!-- Overlay hitam sebagai background -->
                                <div class="absolute inset-0 bg-black bg-opacity-75"></div>
                                
                                <!-- Container utama dengan tombol close di luar container foto -->
                                <div class="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col">
                                    <!-- Tombol Close - di pojok kanan atas -->
                                    <button 
                                        @click="showAddRoomSlideshow = false" 
                                        class="absolute top-4 right-4 z-30 bg-black bg-opacity-50 text-white hover:text-gray-200 p-2 rounded-full"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    
                                    <!-- Container untuk foto yang dibatasi ukurannya -->
                                    <div class="flex-1 flex items-center justify-center mt-8 mb-12 overflow-hidden">
                                        <img 
                                            :src="roomPhotoPreviews[currentAddRoomSlideIndex]" 
                                            alt="Preview foto ruang mess" 
                                            class="max-w-full max-h-full object-contain"
                                        >
                                    </div>
                                    
                                    <!-- Navigasi dan counter foto -->
                                    <div class="flex justify-between items-center w-full px-4">
                                        <!-- Previous Button -->
                                        <button 
                                            @click="prevAddRoomSlide" 
                                            class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                            :disabled="currentAddRoomSlideIndex === 0"
                                            :class="{'opacity-50 cursor-not-allowed': currentAddRoomSlideIndex === 0}"
                                        >
                                            ◀
                                        </button>
                                        
                                        <!-- Counter foto -->
                                        <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-20">
                                            {{ currentAddRoomSlideIndex + 1 }} / {{ roomPhotoPreviews.length }}
                                        </div>
                                        
                                        <!-- Next Button -->
                                        <button 
                                            @click="nextAddRoomSlide" 
                                            class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                                            :disabled="currentAddRoomSlideIndex === (roomPhotoPreviews.length - 1)"
                                            :class="{'opacity-50 cursor-not-allowed': currentAddRoomSlideIndex === (roomPhotoPreviews.length - 1)}"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>
                      
                      <!-- Step 1: Guesthouse Form -->
                      <form v-if="formStep === 1" @submit.prevent="submitGuesthouseForm" class="space-y-4">
                          <!-- Photo upload section -->
                          <div class="mb-6 text-center">
                              <div class="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                  <div v-if="guesthousePhotoPreviews.length === 0" class="text-center cursor-pointer" @click="triggerPhotoInput">
                                      <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                          </svg>
                                      </div>
                                      <div class="text-black font-bold data-gedung-text">Tambah Foto</div>
                                  </div>
                                  
                                  <!-- Photo previews -->
                                  <div v-else class="flex overflow-x-auto p-2 w-full h-full">
                                      <div v-for="(preview, index) in guesthousePhotoPreviews" :key="index" class="relative flex-shrink-0 w-32 h-32 mr-2">
                                          <img :src="preview" class="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" @click="openAddGuesthouseSlideshow(index)"/>
                                          <button @click.stop="removeGuesthousePhoto(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                          </button>
                                      </div>
                                      
                                      <!-- Add more photos button -->
                                      <div class="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer" @click="triggerPhotoInput">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                          </svg>
                                      </div>
                                  </div>
                                  
                                  <input 
                                      type="file" 
                                      ref="photoInput" 
                                      multiple 
                                      accept="image/*" 
                                      class="hidden" 
                                      @change="handleGuesthousePhotoChange"
                                  />
                              </div>
                          </div>
                          
                          <!-- Guesthouse Details -->
                          <div class="space-y-4">
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Nama Gedung</label>
                                  <input 
                                      v-model="newGuesthouse.name" 
                                      type="text" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Tentang Gedung</label>
                                  <textarea 
                                      v-model="newGuesthouse.description" 
                                      rows="4" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  ></textarea>
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Luas Bangunan (m²)</label>
                                  <input 
                                      v-model="newGuesthouse.area_m2" 
                                      type="number" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Contact Person</label>
                                  <input 
                                      v-model="newGuesthouse.contact_person" 
                                      type="text" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Fasilitas Utama</label>
                                  <div class="flex">
                                      <input 
                                          v-model="facilityInput" 
                                          type="text" 
                                          class="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500"
                                          placeholder="Tambah Fasilitas Utama..."
                                      />
                                      <button 
                                          type="button" 
                                          @click="addFacility"
                                          class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 font-semibold data-gedung-text"
                                      >
                                          + Tambah Fasilitas
                                      </button>
                                  </div>
                                  <div class="mt-2 flex flex-wrap gap-2">
                                      <button 
                                          v-for="(quickFacility, index) in quickFacilities" 
                                          :key="'quick-' + index" 
                                          type="button" 
                                          @click="addQuickFacility(quickFacility)"
                                          class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                                      >
                                          {{ quickFacility }}
                                      </button>
                                  </div>
                                  <div class="flex flex-wrap gap-2 mb-2">
                                    <span 
                                        v-for="(facility, index) in newGuesthouse.facilitiesList" 
                                        :key="index" 
                                        class="bg-gray-300 text-black px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {{ facility }}
                                        <button @click="removeFacility(index)" class="ml-2 text-black hover:text-black">
                                            ×
                                        </button>
                                    </span>
                                  </div>
                              </div>
                              
                              <!-- Koordinat Maps -->
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Lokasi</label>
                                  <div class="mb-2">
                                      <div class="flex">
                                          <input
                                              v-model="searchQuery"
                                              type="text"
                                              placeholder="Ketikkan lokasi atau pilih dari peta"
                                              class="w-full px-3 py-2 border text-black border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              @keyup.enter="searchLocation"
                                          />
                                          <button 
                                              type="button" 
                                              @click="searchLocation" 
                                              class="px-4 py-2 bg-blue-500 data-gedung-text font-bold text-white rounded-r-lg hover:bg-blue-600"
                                          >
                                              Cari
                                          </button>
                                      </div>
                                      <p v-if="searchError" class="text-red-500 text-sm mt-1">{{ searchError }}</p>
                                  </div>
                                  <div class="border border-gray-300 rounded-lg overflow-hidden h-48">
                                      <div id="map" class="w-full h-full"></div>
                                  </div>
                                  <div class="flex space-x-4 mt-2 text-sm text-gray-500">
                                      <p hidden>Latitude: {{ newGuesthouse.latitude }}</p>
                                      <p hidden>Longitude: {{ newGuesthouse.longitude }}</p>
                                  </div>
                              </div>

                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Alamat</label>
                                  <input 
                                      v-model="newGuesthouse.address" 
                                      type="text" 
                                      class="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                          </div>
                          
                          <!-- Form navigation buttons -->
                          <div class="flex justify-between pt-4">
                              <button 
                                  type="button" 
                                  @click="closeAddGuesthouseModal" 
                                  class="px-6 py-2 bg-gray-300 data-gedung-text font-bold text-gray-700 rounded-lg hover:bg-gray-400"
                              >
                                  Batal
                              </button>
                              <button 
                                  type="submit" 
                                  class="px-6 py-2 bg-blue-500 data-gedung-text font-bold text-white rounded-lg hover:bg-blue-600 flex items-center"
                                  :disabled="isSubmittingGuesthouse"
                              >
                                  <svg v-if="isSubmittingGuesthouse" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {{ isSubmittingGuesthouse ? 'Menyimpan...' : 'Selanjutnya' }}
                              </button>
                          </div>
                      </form>
                      
                      <!-- Step 2: Room Form -->
                      <form v-if="formStep === 2" @submit.prevent="submitRoomForm" class="space-y-4">
                          <!-- Photo upload section -->
                          <div class="mb-6 text-center">
                              <div class="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                  <div v-if="roomPhotoPreviews.length === 0" class="text-center cursor-pointer" @click="triggerRoomPhotoInput">
                                      <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2 cursor-pointer" @click="triggerRoomPhotoInput">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                          </svg>
                                      </div>
                                      <div class="text-black data-gedung-text font-bold">Tambah Foto Ruang</div>
                                  </div>
                                  
                                  <!-- Photo previews -->
                                  <div v-else class="flex overflow-x-auto p-2 w-full h-full">
                                      <div v-for="(preview, index) in roomPhotoPreviews" :key="index" class="relative flex-shrink-0 w-32 h-32 mr-2">
                                          <img :src="preview" class="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition opacity" @click="openAddRoomSlideshow(index)" />
                                          <button @click.stop="removeRoomPhoto(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                          </button>
                                      </div>
                                      
                                      <!-- Add more photos button -->
                                      <div class="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer" @click.stop="triggerRoomPhotoInput">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                          </svg>
                                      </div>
                                  </div>
                                  
                                  <input 
                                      type="file" 
                                      ref="roomPhotoInput" 
                                      multiple 
                                      accept="image/*" 
                                      class="hidden" 
                                      @change="handleRoomPhotoChange"
                                  />
                              </div>
                          </div>
                          
                          <!-- Room Details -->
                          <div class="space-y-4">
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Nama Ruang</label>
                                  <input 
                                      v-model="newRoom.name" 
                                      type="text" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Jenis Ruang</label>
                                  <div class="flex gap-4">
                                      <label class="flex items-center">
                                          <input type="radio" v-model="newRoom.type" value="vip" class="mr-2 text-black" required />
                                          <span class="flex items-center text-black">
                                            <img src="@/assets/vipclass.png" alt="VIP" class="h-5 mr-1" />
                                          </span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="radio" v-model="newRoom.type" value="standard" class="mr-2" required />
                                          <span class="flex items-center text-black">
                                            <img src="@/assets/standardclass.png" alt="VIP" class="h-5 mr-1" />
                                          </span>
                                      </label>
                                  </div>
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Total Slot</label>
                                  <input 
                                      v-model="newRoom.total_slot" 
                                      type="number" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Luas Ruangan (m²)</label>
                                  <input 
                                      v-model="newRoom.area_m2" 
                                      type="number" 
                                      class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                  />
                              </div>
                              
                              <div>
                                  <label class="block text-black data-gedung-text font-bold mb-1">Fasilitas Ruang</label>
                                  <div class="flex">
                                      <input 
                                          v-model="roomFacilityInput" 
                                          type="text" 
                                          class="flex-grow px-3 py-2 border text-black rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Tambah Fasilitas Ruang..."
                                      />
                                      <button 
                                          type="button" 
                                          @click="addRoomFacility"
                                          class="bg-blue-500 data-gedung-text font-bold text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                                      >
                                          + Tambah
                                      </button>
                                  </div>
                                  <div class="flex flex-wrap gap-2 mt-2 mb-2">
                                      <span 
                                          v-for="(facility, index) in newRoom.facilitiesList" 
                                          :key="index" 
                                          class="bg-blue-100 text-black px-3 py-1 rounded-full text-sm flex items-center"
                                      >
                                          {{ facility }}
                                          <button @click="removeRoomFacility(index)" class="ml-2 text-blue-600 hover:text-blue-800">
                                              ×
                                          </button>
                                      </span>
                                  </div>
                                  <!-- <div class="mt-2 flex flex-wrap gap-2">
                                      <button 
                                          v-for="(quickFacility, index) in quickRoomFacilities" 
                                          :key="'quick-room-' + index" 
                                          type="button" 
                                          @click="addQuickRoomFacility(quickFacility)"
                                          class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                                      >
                                          {{ quickFacility }}
                                      </button>
                                  </div> -->
                              </div>
                              
                              <!-- Kategori Penyewa & Harga Sewa -->
                              <div>
                                  <label class="block text-black font-medium mb-1">Kategori Penyewa & Harga Sewa</label>
                                  <div class="space-y-3">
                                      <div v-for="(pricing, index) in newRoom.pricing" :key="index" class="flex gap-2">
                                          <div class="flex-grow">
                                              <input 
                                                  v-model="pricing.retribution_type" 
                                                  type="text" 
                                                  class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                  placeholder="Kategori Penyewa"
                                                  required
                                              />
                                          </div>
                                          <div class="w-1/3">
                                              <div class="relative">
                                                  <span class="absolute text-black left-3 top-2">Rp</span>
                                                  <input 
                                                      v-model="pricing.price_per_day" 
                                                      type="number" 
                                                      class="w-full px-3 py-2 pl-8 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      placeholder="Harga/hari"
                                                      required
                                                  />
                                              </div>
                                          </div>
                                          <button 
                                              type="button" 
                                              @click="removePricing(index)" 
                                              class="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                          </button>
                                      </div>
                                  </div>
                                  <button 
                                      type="button" 
                                      @click="addPricing" 
                                      class="mt-3 w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                      </svg>
                                      Tambah Kategori Harga Sewa
                                  </button>
                              </div>
                          </div>
                          
                          <!-- Form navigation buttons -->
                          <div class="flex justify-between pt-4">
                              <button 
                                  type="button" 
                                  @click="goBackToStep1" 
                                  class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                              >
                                  Kembali
                              </button>
                              <button 
                                  type="submit" 
                                  class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                                  :disabled="isSubmittingRoom"
                              >
                                  <svg v-if="isSubmittingRoom" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {{ isSubmittingRoom ? 'Menyimpan...' : 'Simpan' }}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
        </transition>

        <!-- Edit Guesthouse Modal -->
        <transition name="modal">
            <div v-if="showEditGuesthouseModal" class="detail-modal fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                <div class="detail-modal-cardbox w-4/5 max-w-4xl rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
                    <!-- Close button -->
                    <button @click="closeEditGuesthouseModal" class="absolute top-4 right-4 text-gray-700 hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <!-- Modal title -->
                    <h2 class="text-2xl text-black font-bold mb-6 data-gedung-text text-center">Edit Gedung Mess</h2>
                    
                    <!-- Form steps indicator -->
                    <div class="flex justify-center mb-6">
                        <div class="w-1/2 flex items-center">
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center data-gedung-text font-bold mr-2',
                                editFormStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                            ]">1</div>
                            <div class="flex-grow h-1" :class="editFormStep === 1 ? 'bg-blue-500' : 'bg-gray-300'"></div>
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center data-gedung-text font-bold ml-2',
                                editFormStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                            ]">2</div>
                        </div>
                    </div>
                    
                    <!-- Step 1: Edit Guesthouse Form -->
                    <form v-if="editFormStep === 1" @submit.prevent="proceedToEditStep2" class="space-y-4">
                        <!-- Photo upload section -->
                        <div class="mb-6 text-center">
                            <div class="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2 cursor-pointer" @click="triggerEditPhotoInput">
                                <div v-if="editGuesthousePhotoPreviews.length === 0" class="text-center">
                                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div class="text-black font-bold">Tambah Foto</div>
                                </div>
                                
                                <!-- Photo previews -->
                                <div v-else class="flex overflow-x-auto p-2 w-full h-full">
                                    <div v-for="(preview, index) in editGuesthousePhotoPreviews" :key="index" class="relative flex-shrink-0 w-32 h-32 mr-2">
                                        <img :src="preview" class="w-32 h-32 object-cover rounded-lg" />
                                        <button @click.stop="removeEditGuesthousePhoto(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <!-- Add more photos button -->
                                    <div class="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer" @click.stop="triggerEditPhotoInput">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <input 
                                    type="file" 
                                    ref="editPhotoInput" 
                                    multiple 
                                    accept="image/*" 
                                    class="hidden" 
                                    @change="handleEditGuesthousePhotoChange"
                                />
                            </div>
                        </div>
                        
                        <!-- Guesthouse Details -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Nama Gedung</label>
                                <input 
                                    v-model="editGuesthouse.name" 
                                    type="text" 
                                    class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Tentang Gedung</label>
                                <textarea 
                                    v-model="editGuesthouse.description" 
                                    rows="4" 
                                    class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                ></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Luas Bangunan (m²)</label>
                                <input 
                                    v-model="editGuesthouse.area_m2" 
                                    type="string" 
                                    class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Contact Person</label>
                                <input 
                                    v-model="editGuesthouse.contact_person" 
                                    type="text" 
                                    class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Fasilitas Utama</label>
                                <div class="flex">
                                    <input 
                                        v-model="editFacilityInput" 
                                        type="text" 
                                        class="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500"
                                        placeholder="Tambah Fasilitas Utama..."
                                    />
                                    <button 
                                        type="button" 
                                        @click="addEditFacility"
                                        class="bg-blue-500 text-white data-gedung-text font-bold px-4 py-2 rounded-r-lg hover:bg-blue-600"
                                    >
                                        + Tambah Fasilitas
                                    </button>
                                </div>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <button 
                                        v-for="(quickFacility, index) in quickFacilities" 
                                        :key="'quick-' + index" 
                                        type="button" 
                                        @click="addEditQuickFacility(quickFacility)"
                                        class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                                    >
                                        {{ quickFacility }}
                                    </button>
                                </div>
                                <div class="flex flex-wrap gap-2 mb-2">
                                    <span 
                                        v-for="(facility, index) in editGuesthouse.facilitiesList" 
                                        :key="index" 
                                        class="bg-gray-300 text-black px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {{ facility }}
                                        <button @click="removeEditFacility(index)" class="ml-2 text-black hover:text-blue-800">
                                            ×
                                        </button>
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Koordinat Maps -->
                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Lokasi</label>
                                <div class="mb-2">
                                    <div class="flex">
                                        <input
                                            v-model="editSearchQuery"
                                            type="text"
                                            placeholder="Ketikkan lokasi atau pilih dari peta"
                                            class="w-full px-3 py-2 border text-black border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            @keyup.enter="searchEditLocation"
                                        />
                                        <button 
                                            type="button" 
                                            @click="searchEditLocation" 
                                            class="px-4 py-2 bg-blue-500 text-white data-gedung-text font-bold rounded-r-lg hover:bg-blue-600"
                                        >
                                            Cari
                                        </button>
                                    </div>
                                    <p v-if="editSearchError" class="text-red-500 text-sm mt-1">{{ editSearchError }}</p>
                                </div>
                                <div class="border border-gray-300 rounded-lg overflow-hidden h-48">
                                    <div id="editMap" class="w-full h-full"></div>
                                </div>
                                <div class="flex space-x-4 mt-2 text-sm text-gray-500">
                                    <p hidden>Latitude: {{ editGuesthouse.latitude }}</p>
                                    <p hidden>Longitude: {{ editGuesthouse.longitude }}</p>
                                </div>
                            </div>

                            <div>
                                <label class="block text-black data-gedung-text font-bold mb-1">Alamat</label>
                                <input 
                                    v-model="editGuesthouse.address" 
                                    type="text" 
                                    class="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        
                        <!-- Form navigation buttons -->
                        <div class="flex justify-between pt-4">
                            <button 
                                type="button" 
                                @click="closeEditGuesthouseModal" 
                                class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-gray-400 font-semibold data-gedung-text"
                            >
                                Batal
                            </button>
                            <div class="flex space-x-2">
                                <button 
                                    type="submit" 
                                    class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex font-semibold data-gedung-text items-center"
                                >
                                    Selanjutnya
                                </button>
                                <button 
                                    type="button" 
                                    @click="submitEditGuesthouseForm" 
                                    class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex font-semibold data-gedung-text items-center"
                                    :disabled="isSubmittingEditGuesthouse"
                                >
                                    <svg v-if="isSubmittingEditGuesthouse" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {{ isSubmittingEditGuesthouse ? 'Menyimpan...' : 'Simpan Perubahan' }}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <!-- Step 2: Room Management -->
                    <div v-if="editFormStep === 2" class="space-y-6">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl text-gray-600 font-bold">Kelola Ruang Mess</h3>
                            <button 
                                @click="addRoomToGuesthouse" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Tambah Ruang</span>
                            </button>
                        </div>
                        
                        <!-- Room List -->
                        <div v-if="editRooms.length === 0" class="text-center py-8 border rounded-lg">
                            <p class="text-gray-600">Belum ada ruang mess. Silakan tambahkan ruang baru.</p>
                        </div>
                        
                        <div v-else class="space-y-4">
                            <div v-for="room in editRooms" :key="room.id" class="border border-gray-500 p-4 rounded-lg">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="flex items-center mb-2">
                                            <h4 class="text-lg font-bold text-gray-600">{{ room.name }}</h4>
                                            <div 
                                                v-if="room.type.toLowerCase() === 'vip'" 
                                                class="ml-2 bg-yellow-400 px-2 py-0.5 rounded-md text-sm font-bold text-white"
                                            >
                                                VIP
                                            </div>
                                            <div 
                                                v-else-if="room.type.toLowerCase() === 'standard'" 
                                                class="ml-2 bg-gray-400 px-2 py-0.5 rounded-md text-sm font-bold text-white"
                                            >
                                                Standard
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-600">Total slot: {{ room.total_slot }}</p>
                                        <p class="text-sm text-gray-600">Luas: {{ room.area_m2 }} m²</p>
                                    </div>
                                    
                                    <div class="flex space-x-2">
                                        <button 
                                            @click="selectRoomForEdit(room)" 
                                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            @click="deleteRoom(room.id)" 
                                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            :disabled="isDeletingRoom"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Form navigation buttons -->
                        <div class="flex justify-between pt-4">
                            <button 
                                type="button" 
                                @click="goBackToEditStep1" 
                                class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold data-gedung-text"
                            >
                                Kembali
                            </button>
                            <button 
                                type="button" 
                                @click="closeEditGuesthouseModal" 
                                class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold data-gedung-text"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                    
                    <!-- Edit Room Form (Slide-in panel) -->
                    <div 
                        v-if="selectedEditRoom" 
                        class ="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-60 overflow-y-auto p-4"
                    >
                    <div class="edit-room-form bg-white w-full sm:w-3/4 max-w-2xl rounded-lg shadow-lg p-6 my-4 mx-auto relative max-h-[90vh] overflow-y-auto">
                          <div class="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2 z-10">
                              <h3 class="text-xl text-black font-bold">{{ selectedEditRoom.isNew ? 'Tambah Ruang Baru' : 'Edit Ruang' }}</h3>
                              <button @click="closeEditRoomForm" class="text-gray-700 hover:text-gray-900">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                              </button>
                          </div>
                            
                            <!-- Room Edit Form -->
                            <form @submit.prevent="selectedEditRoom.isNew ? submitNewRoomForm() : submitEditRoomForm()" class="space-y-4">
                                <!-- Photo upload section -->
                                <div class="mb-6 text-center">
                                    <div class="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2 cursor-pointer" @click="triggerEditRoomPhotoInput">
                                        <div v-if="editRoomPhotoPreviews.length === 0" class="text-center">
                                            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div class="text-black font-bold">Tambah Foto Ruang</div>
                                        </div>
                                        
                                        <!-- Photo previews -->
                                        <div v-else class="flex overflow-x-auto p-2 w-full h-full">
                                            <div v-for="(preview, index) in editRoomPhotoPreviews" :key="index" class="relative flex-shrink-0 w-32 h-32 mr-2">
                                                <img :src="preview" class="w-32 h-32 object-cover rounded-lg" />
                                                <button @click.stop="removeEditRoomPhoto(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <!-- Add more photos button -->
                                            <div class="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer" @click.stop="triggerEditRoomPhotoInput">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        <input 
                                            type="file" 
                                            ref="editRoomPhotoInput" 
                                            multiple 
                                            accept="image/*" 
                                            class="hidden" 
                                            @change="handleEditRoomPhotoChange"
                                        />
                                    </div>
                                </div>
                                
                                <!-- Room Details -->
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-black font-medium mb-1">Nama Ruang</label>
                                        <input 
                                            id="editRoomName"
                                            v-model="editRoom.name" 
                                            type="text" 
                                            class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label class="block text-black font-medium mb-1">Jenis Ruang</label>
                                        <div class="flex gap-4">
                                            <label class="flex items-center">
                                                <input type="radio" v-model="editRoom.type" value="vip" class="mr-2 text-black" required />
                                                <span class="flex items-center text-black">
                                                  <img src="@/assets/vipclass.png" alt="VIP" class="h-5 mr-1" />
                                                </span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="radio" v-model="editRoom.type" value="standard" class="mr-2" required />
                                                <span class="flex items-center text-black">
                                                  <img src="@/assets/standardclass.png" alt="Standard" class="h-5 mr-1" />
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-black font-medium mb-1">Total Slot</label>
                                        <input 
                                            v-model="editRoom.total_slot" 
                                            type="number" 
                                            class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label class="block text-black font-medium mb-1">Luas Ruangan (m²)</label>
                                        <input 
                                            v-model="editRoom.area_m2" 
                                            type="number" 
                                            class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label class="block text-black font-medium mb-1">Fasilitas Ruang</label>
                                        <div class="flex flex-wrap gap-2 mb-2">
                                            <span 
                                                v-for="(facility, index) in editRoom.facilitiesList" 
                                                :key="index" 
                                                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                            >
                                                {{ facility }}
                                                <button @click="removeEditRoomFacility(index)" class="ml-2 text-blue-600 hover:text-blue-800">
                                                    ×
                                                </button>
                                            </span>
                                        </div>
                                        <div class="flex">
                                            <input 
                                                v-model="editRoomFacilityInput" 
                                                type="text" 
                                                class="flex-grow px-3 py-2 border text-black rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Tambah Fasilitas Ruang..."
                                                @keyup.enter="addEditRoomFacility"
                                            />
                                            <button 
                                                type="button" 
                                                @click="addEditRoomFacility"
                                                class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                                            >
                                                + Tambah
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Kategori Penyewa & Harga Sewa -->
                                    <div>
                                        <label class="block text-black font-medium mb-1">Kategori Penyewa & Harga Sewa</label>
                                        <div class="space-y-3">
                                            <div v-for="(pricing, index) in editRoom.pricing" :key="index" class="flex gap-2">
                                                <div class="flex-grow">
                                                    <input 
                                                        v-model="pricing.retribution_type" 
                                                        type="text" 
                                                        class="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Kategori Penyewa"
                                                        required
                                                    />
                                                </div>
                                                <div class="w-1/3">
                                                    <div class="relative">
                                                        <span class="absolute text-black left-3 top-2">Rp</span>
                                                        <input 
                                                            v-model="pricing.price_per_day" 
                                                            type="number" 
                                                            class="w-full px-3 py-2 pl-8 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Harga/hari"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    @click="removeEditPricing(index)" 
                                                    class="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            @click="addEditPricing" 
                                            class="mt-3 w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Tambah Kategori Harga Sewa
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Form buttons -->
                                <div class="flex justify-end pt-6 space-x-3 sticky bottom-0 bg-white pb-2 z-10">
                                  <button 
                                      type="button" 
                                      @click="closeEditRoomForm" 
                                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                  >
                                      Batal
                                  </button>
                                  <button 
                                      type="submit" 
                                      class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                                      :disabled="isSubmittingEditRoom"
                                  >
                                      <svg v-if="isSubmittingEditRoom" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      {{ isSubmittingEditRoom ? 'Menyimpan...' : 'Simpan' }}
                                  </button>
                              </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

      <!-- Modal Popup Detail -->
      <transition name="modal">
          <div v-if="showModal" class="detail-modal fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <div class="detail-modal-cardbox w-3/4 max-w-3xl rounded-2xl shadow-lg p-0 relative overflow-hidden">
                  <!-- Tombol Close di atas gambar -->
                  <button @click="showModal = false" class="absolute top-4 right-4 text-white hover:text-gray-200 z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>

                  <!-- Loading Skeleton for the entire modal -->
                  <template v-if="isLoadingDetail">
                      <!-- Skeleton for Image -->
                      <div class="relative w-full h-80 bg-gray-200 animate-pulse"></div>
                      
                      <!-- Skeleton for Content -->
                      <div class="p-6">
                          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                          <div class="h-4 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
                          
                          <!-- Tentang Gedung Skeleton -->
                          <div class="bg-white p-4 rounded-lg mt-4 shadow-xl">
                              <div class="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                              <div class="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                              <div class="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                              <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                          
                          <!-- Fasilitas Utama Skeleton -->
                          <div class="bg-white p-4 rounded-lg mt-4 shadow-xl">
                              <div class="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                              <div class="flex flex-wrap gap-2 mt-2">
                                  <div class="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                                  <div class="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                                  <div class="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
                              </div>
                          </div>
                          
                          <!-- Daftar Harga Sewa Skeleton -->
                          <div class="bg-white p-4 rounded-xl mt-4 shadow-xl">
                              <div class="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                              <div class="border border-gray-300 rounded-lg p-4 mt-2">
                                  <div class="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                                  <div class="h-8 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
                                  <div class="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                              </div>
                          </div>
                          
                          <!-- Ulasan Tamu Skeleton -->
                          <div class="bg-white p-6 rounded-xl mt-4 shadow-xl">
                              <div class="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                              <div class="mt-3">
                                  <div class="border rounded-lg overflow-hidden">
                                      <div class="p-4">
                                          <div class="flex items-start justify-between">
                                              <div class="flex items-center space-x-3">
                                                  <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                                  <div>
                                                      <div class="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                                      <div class="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                                                      <div class="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                                                  </div>
                                              </div>
                                              <div class="flex items-center space-x-1 mr-4">
                                                  <div class="w-6 h-6 bg-gray-200 rounded-full mr-1 animate-pulse"></div>
                                                  <div class="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </template>

                  <!-- Actual Modal Content (when data is loaded) -->
                  <template v-else>
                      <!-- Konten Modal -->
                      <div class="relative">
                          <!-- Gambar Utama - Full Width -->
                          <div class="relative w-full h-80">
                              <img
                                  :src="selectedGuesthouse?.guesthouse_media && selectedGuesthouse.guesthouse_media.length > 0 
                                      ? selectedGuesthouse.guesthouse_media[0].url 
                                      : 'https://via.placeholder.com/300x200'"
                                  :alt="selectedGuesthouse?.name"
                                  class="w-full h-80 object-cover"
                              >
                              <div class="absolute inset-0 bg-black opacity-50 photo-overlay" :style="{ opacity: isHoveringPhotoButton ? '0' : '0.5' }"></div>
                          </div>
                          
                          <!-- Tombol Lihat Semua Foto - tetap di tengah -->
                          <div class="absolute inset-0 flex items-center justify-center">
                              <button @click="openPhotoSlideshow" @mouseenter="handlePhotoButtonHover(true)" @mouseleave="handlePhotoButtonHover(false)" class="foto-button flex flex-col items-center">
                                  <div class="foto-icon-container">
                                      <img src="@/assets/gallery.png" alt="Gallery" class="w-8 h-8" />
                                  </div>
                                  <span class="foto-text font-black">Lihat Semua Foto</span>
                              </button>
                          </div>
                          
                          <!-- Tombol Lihat di Maps - tetap di bawah kanan -->
                          <div class="absolute bottom-4 right-4">
                              <a 
                                  :href="getMapsUrl(selectedGuesthouse?.latitude, selectedGuesthouse?.longitude)" 
                                  target="_blank" 
                                  class="maps-button bg-white rounded-xl p-3 shadow-md flex flex-col items-center"
                              >
                                  <img src="@/assets/maps.png" alt="Maps" class="h-8" />
                                  <span class="maps-text text-sm text-center font-black block mt-1">Lihat di Maps</span>
                              </a>
                          </div>
                      </div>

                      <!-- Content di bawah gambar -->
                      <div class="p-6">
                          <h2 id="nama-gedung-detail" class="nama-gedung text-2xl font-black text-black mb-1">{{ selectedGuesthouse?.name }}</h2>
                          <p class="text-black font-medium">{{ selectedGuesthouse?.address }}</p>

                          <!-- Tentang Gedung -->
                          <div class="bg-white p-4 rounded-lg mt-4 shadow-xl">
                              <h3 class="font-bold text-black header-content">Tentang Mess</h3>
                              <p class="text-black mt-3 text-justify text-sm">{{ selectedGuesthouse?.description }}</p>
                          </div>

                          <!-- Fasilitas Utama -->
                          <div class="bg-white p-4 rounded-lg mt-4 shadow-xl">
                              <h3 class="font-bold text-black header-content">Fasilitas Utama</h3>
                              <div class="flex flex-wrap gap-2 mt-2">
                                  <span v-for="(facility, index) in facilitiesList" :key="index" class="facility-badge">
                                      {{ facility }}
                                  </span>
                              </div>
                          </div>

                          <!-- Daftar Harga Sewa -->
                          <div class="bg-white p-4 rounded-xl mt-4 shadow-xl">
                              <h3 class="font-bold text-black header-content">Daftar Harga Sewa</h3>
                              
                              <!-- Skeleton loader for rooms -->
                              <div v-if="isLoadingRooms" class="border border-gray-300 rounded-lg p-4 mt-2">
                                <div class="skeleton h-6 w-32 mb-3"></div>
                                <div class="skeleton h-8 w-40 mb-3"></div>
                                <div class="skeleton h-5 w-24 mb-3"></div>
                              </div>
                              
                              <!-- No rooms message -->
                              <div v-else-if="rooms.length === 0" class="p-4 text-center mt-3 border rounded-lg">
                                <p class="text-gray-600">Belum ada data kamar untuk ruang mess ini.</p>
                              </div>
                              
                              <!-- Room data -->
                              <div v-else v-for="room in rooms" :key="room.id" class="border border-gray-300 rounded-lg p-4 mt-2">
                                  <!-- Room name and type badge -->
                                  <div class="flex items-center mb-3">
                                      <span class="text-black font-bold text-lg">{{ room.name }}</span>
                                      <div 
                                          v-if="room.type.toLowerCase() === 'vip'" 
                                          class="ml-2 bg-yellow-400 px-2 py-0.5 rounded-md text-sm font-bold text-white"
                                      >
                                          VIP
                                      </div>
                                      <div 
                                          v-else-if="room.type.toLowerCase() === 'standard'" 
                                          class="ml-2 bg-gray-400 px-2 py-0.5 rounded-md text-sm font-bold text-white"
                                      >
                                          Standard
                                      </div>
                                  </div>
                                  
                                  <!-- Room pricing -->
                                  <div class="flex flex-wrap gap-4 mt-3">
                                    <div v-for="price in room.pricing" :key="price.id" class="inline-flex gap-x-2 items-center justify-start border border-gray-300 rounded-xl px-5 py-1.5">
                                    <span class="text-black mr-2">{{ price.retribution_type }}</span>
                                    <span class="text-black font-bold">Rp{{ formatCurrency(price.price_per_day) }}/hari</span>
                                    </div> 
                                  </div>
                                  
                                  <!-- Room facilities -->
                                  <div class="mt-4">
                                      <span class="text-black">Fasilitas</span>
                                      <div class="flex flex-wrap gap-2 mt-1">
                                          <span v-for="(facility, facilityIndex) in room.facilities.split(';')" :key="facilityIndex" class="facility-badge">
                                              {{ facility.trim() }}
                                          </span>
                                      </div>
                                  </div>
                                  
                                  <!-- Room availability -->
                                  <p class="text-black mt-3">
                                      Total slot: <strong>{{ room.total_slot }} slot</strong>
                                  </p>
                                  
                                  <!-- Room images -->
                                  <div v-if="room.media && room.media.length > 0" class="flex overflow-x-auto gap-2 mt-4 pb-2">
                                      <div 
                                          v-for="(media, mediaIndex) in room.media" 
                                          :key="mediaIndex" 
                                          class="cursor-pointer"
                                          @click="openRoomPhotoSlideshow(room, mediaIndex)"
                                      >
                                          <img 
                                              :src="media.url" 
                                              :alt="`${room.name} image ${mediaIndex + 1}`"
                                              class="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <!-- Ulasan Tamu -->
                          <div class="bg-white p-6 rounded-xl mt-4 shadow-xl">
                              <h3 class="font-bold text-black header-content text-lg">Ulasan dari Tamu</h3>
                              
                              <!-- Skeleton Loader (Loading State) -->
                              <div v-if="isLoadingReviews" class="mt-4">
                                  <div class="skeleton h-24 w-full rounded-lg mb-4"></div>
                                  <div class="skeleton h-24 w-full rounded-lg mb-4"></div>
                              </div>
                              
                              <!-- Tidak ada review -->
                              <div v-else-if="reviews.length === 0" class="p-4 text-center mt-3 border rounded-lg">
                                  <p class="text-gray-600">Belum ada ulasan untuk ruang mess ini.</p>
                              </div>
                              
                              <!-- Review Cards -->
                              <div v-else>
                                  <div v-for="review in reviews" :key="review.id" class="mt-3">
                                      <!-- Review Card -->
                                      <div class="border rounded-lg overflow-hidden">
                                          <!-- Review Content -->
                                          <div class="p-4">
                                              <div class="flex items-start relative">
                                                  <div class="flex items-center space-x-3 pr-20">
                                                      <img 
                                                          :src="review.rent.renter.profile_picture || 'https://via.placeholder.com/50'" 
                                                          alt="Profile Picture" 
                                                          class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                      />
                                                      <div>
                                                          <p class="text-gray-600 text-sm">Diulas {{ formatReviewDate(review.created_at) }}</p>
                                                          <p class="text-gray-800 font-bold">{{ review.rent.renter.fullname }}</p>
                                                          <p class="text-gray-600 text-sm">{{ review.comment }}</p>
                                                      </div>
                                                  </div>

                                                  <div class="flex items-center space-x-1 absolute top-0 right-0">
                                                      <img src="@/assets/star.png" alt="Rating" class="w-6 h-6 mr-1" />
                                                      <span class="text-black font-bold text-base">{{ review.rating }}/5</span>
                                                  </div>
                                              </div>
                                              
                                              <!-- Foto review -->
                                              <div v-if="review.review_media && review.review_media.length > 0" class="mt-3 flex space-x-2 overflow-x-auto py-2">
                                                  <img 
                                                      v-for="(media, mediaIndex) in review.review_media" 
                                                      :key="media.id" 
                                                      :src="media.url" 
                                                      class="h-24 w-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                      alt="Review Image"
                                                      @click="openReviewPhotoSlideshow(review, mediaIndex)"
                                                  />
                                              </div>
                                              
                                              <!-- Review Reply Button - Only show if no reply exists -->
                                              <div v-if="!review.review_reply" class="mt-3 flex justify-end">
                                                  <button 
                                                      @click="toggleReplyForm(review.id)" 
                                                      class="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                                  >
                                                      Balas
                                                  </button>
                                              </div>
                                              
                                              <!-- Reply Form -->
                                              <div v-if="activeReplyId === review.id" class="mt-3 border-t pt-3">
                                                  <textarea
                                                      v-model="replyText"
                                                      rows="2"
                                                      class="w-full p-2 border border-gray-300 rounded-lg text-gray-600"
                                                      placeholder="Tulis balasan Anda..."
                                                  ></textarea>
                                                  <div class="flex justify-end space-x-2 mt-2">
                                                      <button 
                                                          @click="toggleReplyForm(review.id)" 
                                                          class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                                                      >
                                                          Batal
                                                      </button>
                                                      <button 
                                                          @click="submitReply(review.rentId, review.id)" 
                                                          class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center"
                                                          :disabled="isSubmittingReply"
                                                      >
                                                          <svg v-if="isSubmittingReply" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                          </svg>
                                                          {{ isSubmittingReply ? 'Mengirim...' : 'Kirim Balasan' }}
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                          
                                          <!-- Admin Reply (if exists) -->
                                          <div v-if="review.review_reply" class="bg-gray-50 p-4 border-t">
                                              <div class="flex items-start space-x-3">
                                                  <!-- Admin Icon -->
                                                  <div class="bg-blue-100 text-blue-800 p-2 rounded-full">
                                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                      </svg>
                                                  </div>
                                                  
                                                  <!-- Admin Reply Content -->
                                                  <div class="flex-1">
                                                      <div class="flex items-center space-x-2">
                                                          <!-- Admin Name - Dynamic from API -->
                                                          <p class="font-semibold text-black">{{ getAdminName(review.review_reply.adminId) }}</p>
                                                          <p class="text-gray-500 text-xs">{{ formatReviewDate(review.review_reply.createdAt) }}</p>
                                                          <p v-if="review.review_reply.updatedAt !== review.review_reply.createdAt" class="text-gray-500 text-xs italic">(diubah)</p>
                                                      </div>
                                                      
                                                      <!-- Normal display of reply -->
                                                      <p v-if="activeEditReplyId !== review.id" class="text-gray-700 mt-1">{{ review.review_reply.comment }}</p>
                                                      
                                                      <!-- Edit reply form -->
                                                      <div v-else class="mt-2">
                                                          <textarea
                                                              v-model="editReplyText"
                                                              rows="3"
                                                              class="w-full p-2 border border-gray-300 rounded-lg text-gray-600"
                                                              placeholder="Edit balasan Anda..."
                                                          ></textarea>
                                                          <div class="flex justify-end space-x-2 mt-2">
                                                              <button 
                                                                  @click="cancelEditReply" 
                                                                  class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                                                              >
                                                                  Batal
                                                              </button>
                                                              <button 
                                                                  @click="updateReply(review.rentId, review.id, review.review_reply.id)" 
                                                                  class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center"
                                                                  :disabled="isUpdatingReply"
                                                              >
                                                                  <svg v-if="isUpdatingReply" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                  </svg>
                                                                  {{ isUpdatingReply ? 'Menyimpan...' : 'Simpan Perubahan' }}
                                                              </button>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  
                                                  <!-- Action Buttons (Edit & Delete) -->
                                                  <div v-if="activeEditReplyId !== review.id" class="flex space-x-2">
                                                      <!-- Edit Button -->
                                                      <button 
                                                          @click="showEditReplyForm(review)" 
                                                          class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                                          title="Edit balasan"
                                                      >
                                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                          </svg>
                                                      </button>
                                                      
                                                      <!-- Delete Button -->
                                                      <button 
                                                          v-if="isConfirmingReplyDelete !== review.id" 
                                                          @click="confirmDeleteReply(review.id)" 
                                                          class="text-gray-400 hover:text-red-600 transition-colors duration-200"
                                                          title="Hapus balasan"
                                                      >
                                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                          </svg>
                                                      </button>
                                                      
                                                      <!-- Confirmation Buttons -->
                                                      <div v-else class="flex space-x-1">
                                                          <!-- Show spinner if deleting -->
                                                          <div v-if="isDeletingReply" class="flex items-center">
                                                              <svg class="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                              </svg>
                                                          </div>
                                                          <button 
                                                              v-else
                                                              @click="deleteReply(review.rentId, review.id)" 
                                                              class="text-red-500 hover:text-red-700 text-xs font-medium"
                                                              title="Konfirmasi hapus"
                                                          >
                                                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                              </svg>
                                                          </button>
                                                          <button 
                                                              @click="cancelDeleteReply()" 
                                                              class="text-gray-500 hover:text-gray-700 text-xs font-medium"
                                                              title="Batal hapus"
                                                              :disabled="isDeletingReply"
                                                          >
                                                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                              </svg>
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </template>
              </div>
          </div>
      </transition>

      <!-- Guesthouse Photo Slideshow Modal -->
      <transition name="modal">
          <div v-if="showSlideshow" class="photo-slideshow fixed inset-0 flex items-center justify-center z-50">
              <!-- Overlay hitam sebagai background -->
              <div class="absolute inset-0 bg-black bg-opacity-75"></div>
              
              <!-- Container utama dengan tombol close di luar container foto -->
              <div class="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col">
                  <!-- Tombol Close - di pojok kanan atas, tidak terikat pada foto -->
                  <button 
                      @click="showSlideshow = false" 
                      class="absolute top-4 right-4 z-30 bg-black bg-opacity-50 text-white hover:text-gray-200 p-2 rounded-full"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                  
                  <!-- Container untuk foto yang dibatasi ukurannya -->
                  <div class="flex-1 flex items-center justify-center mt-8 mb-12 overflow-hidden">
                      <img 
                          :src="selectedGuesthouse?.guesthouse_media[currentSlideIndex]?.url" 
                          :alt="selectedGuesthouse?.name" 
                          class="max-w-full max-h-full object-contain"
                      >
                  </div>
                  
                  <!-- Navigasi dan counter foto -->
                  <div class="flex justify-between items-center w-full px-4">
                      <!-- Previous Button -->
                      <button 
                          @click="prevSlide" 
                          class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                          :disabled="currentSlideIndex === 0"
                          :class="{'opacity-50 cursor-not-allowed': currentSlideIndex === 0}"
                      >
                          ◀
                      </button>
                      
                      <!-- Counter foto -->
                      <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-20">
                          {{ currentSlideIndex + 1 }} / {{ selectedGuesthouse?.guesthouse_media.length }}
                      </div>
                      
                      <!-- Next Button -->
                      <button 
                          @click="nextSlide" 
                          class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                          :disabled="currentSlideIndex === (selectedGuesthouse?.guesthouse_media.length - 1)"
                          :class="{'opacity-50 cursor-not-allowed': currentSlideIndex === (selectedGuesthouse?.guesthouse_media.length - 1)}"
                      >
                          ▶
                      </button>
                  </div>
              </div>
          </div>
      </transition>

      <!-- Room Photo Slideshow Modal -->
      <transition name="modal">
          <div v-if="showRoomSlideshow" class="photo-slideshow fixed inset-0 flex items-center justify-center z-50">
              <!-- Overlay hitam sebagai background -->
              <div class="absolute inset-0 bg-black bg-opacity-75"></div>
              
              <!-- Container utama dengan tombol close di luar container foto -->
              <div class="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col">
                  <!-- Tombol Close - di pojok kanan atas, tidak terikat pada foto -->
                  <button 
                      @click="showRoomSlideshow = false" 
                      class="absolute top-4 right-4 z-30 bg-black bg-opacity-50 text-white hover:text-gray-200 p-2 rounded-full"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                  
                  <!-- Container untuk foto yang dibatasi ukurannya -->
                  <div class="flex-1 flex items-center justify-center mt-8 mb-12 overflow-hidden">
                      <img 
                          :src="selectedRoom?.media[currentRoomSlideIndex]?.url" 
                          :alt="selectedRoom?.name" 
                          class="max-w-full max-h-full object-contain"
                      >
                  </div>
                  
                  <!-- Navigasi dan counter foto -->
                  <div class="flex justify-between items-center w-full px-4">
                      <!-- Previous Button -->
                      <button 
                          @click="prevRoomSlide" 
                          class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                          :disabled="currentRoomSlideIndex === 0"
                          :class="{'opacity-50 cursor-not-allowed': currentRoomSlideIndex === 0}"
                      >
                          ◀
                      </button>
                      
                      <!-- Counter foto -->
                      <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full z-20">
                          {{ currentRoomSlideIndex + 1 }} / {{ selectedRoom?.media.length }}
                      </div>
                      
                      <!-- Next Button -->
                      <button 
                          @click="nextRoomSlide" 
                          class="navigation-button bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 text-xl z-20"
                          :disabled="currentRoomSlideIndex === (selectedRoom?.media.length - 1)"
                          :class="{'opacity-50 cursor-not-allowed': currentRoomSlideIndex === (selectedRoom?.media.length - 1)}"
                      >
                          ▶
                      </button>
                  </div>
              </div>
          </div>
      </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation.vue';

export default {
  name: 'DataRuangMessView',
  components: { Navigation },

    watch: {
        formStep(newVal, oldVal) {
            if (newVal === 1 && oldVal === 2) {
            this.$nextTick(() => {
                setTimeout(() => {
                this.reinitializeMap();
                }, 400);
            });
            }
        },
        
        showAddGuesthouseModal(newVal) {
            if (newVal && this.formStep === 1) {
            this.$nextTick(() => {
                setTimeout(() => {
                this.initMap();
                }, 400);
            });
            }
        },
        
        // TAMBAHAN UNTUK EDIT MODAL
        editFormStep(newVal, oldVal) {
            // Ketika kembali dari step 2 ke step 1 di edit modal
            if (newVal === 1 && oldVal === 2) {
            this.$nextTick(() => {
                setTimeout(() => {
                this.reinitializeEditMap();
                }, 400);
            });
            }
        },
        
        showEditGuesthouseModal(newVal) {
            if (newVal && this.editFormStep === 1) {
            this.$nextTick(() => {
                setTimeout(() => {
                this.initEditMap();
                }, 400);
            });
            }
        }
    },

  data() {
      return {
          // Data state
          guesthouses: [],
          selectedGuesthouse: null,
          rooms: [],
          selectedRoom: null,
          reviews: [], // Array untuk menyimpan review
          admins: {}, // Object untuk menyimpan data admin berdasarkan ID
          selectedReview: null, // Review yang dipilih untuk lihat foto
          createdGuesthouseId: null,
          showEditGuesthouseModal: false,
          editFormStep: 1,
          editGuesthouseId: null,
          isSubmittingEditGuesthouse: false,
          isSubmittingEditRoom: false,
          isDeletingRoom: false,
          deletingRoomId: null, // Track which room is being deleted

          // map data state
          map: null,
          marker: null,
          searchError: null,
          searchQuery: '',
          searchError: null,
          editMap: null,
          editMarker: null,
          editSearchError: null,
          
          // UI state
          isLoading: true,
          isLoadingDetail: false,
          isLoadingRooms: false,
          isLoadingReviews: false, // loading state untuk review
          isLoadingAdmins: false, // Loading state untuk data admin
          isSubmittingGuesthouse: false, // Loading state ketika submit input gedung mess
          isSubmittingRoom: false, // Loading state ketika 
          showModal: false,
          showAddGuesthouseModal: false, // state awal 
          showAddGuesthouseSlideshow: false,
          showAddRoomSlideshow: false,
          currentAddGuesthouseSlideIndex: 0,
          currentAddRoomSlideIndex: 0,
          formStep: 1, // index state input form tambah gedung mess
          showSlideshow: false,
          showRoomSlideshow: false,
          showReviewSlideshow: false, // State untuk slideshow foto review
          currentSlideIndex: 0,
          currentRoomSlideIndex: 0,
          currentReviewSlideIndex: 0, // Index foto review yang aktif
          isHoveringPhotoButton: false,

          // isi form awal gedung mess
          newGuesthouse: {
            name: '',
            address: '',
            description: '',
            facilities: '',
            facilitiesList: [], // Array to hold individual facilities
            area_m2: '',
            contact_person: '',
            latitude: '',
            longitude: '',
        },
        guesthousePhotos: [], // foto yang di upload
        guesthousePhotoPreviews: [], // foto yang dipreview

        // isi form awal ruang gedung mess
        newRoom: {
            name: '',
            type: 'standard',
            facilities: '',
            facilitiesList: [], // Array to hold individual facilities
            total_slot: 1,
            area_m2: '',
            pricing: [
                {
                    retribution_type: '',
                    price_per_day: '',
                    is_available: true
                }
            ]
        },
        roomPhotos: [], // foto yang di upload
        roomPhotoPreviews: [], // foto yang dipreview
        facilityInput: '',
        roomFacilityInput: '',
          
        // Review state
        activeReplyId: null, // ID ulasan yang akan dibalas
        replyText: '', // Text untuk balas ulasan
        isSubmittingReply: false, // State saat submit reply
        isConfirmingReplyDelete: null, // ID ulasan yang akan dihapus balasannya
        isDeletingReply: false, // Loading state saat menghapus reply
        activeEditReplyId: null, // ID ulasan yang akan diedit balasannya
        editReplyText: '', // Text untuk edit balasan
        isUpdatingReply: false, // Loading state saat update reply

        // Edit Guesthouse data
        editGuesthouse: {
          id: null,
          name: '',
          address: '',
          description: '',
          facilities: '',
          facilitiesList: [],
          area_m2: '',
          contact_person: '',
          latitude: '',
          longitude: '',
          media: []
        },
        editGuesthousePhotos: [],
        editGuesthousePhotoPreviews: [],
        deletedGuesthouseMedia: [],

        // edit guesthouse room data
        editRooms: [], // Array of rooms for the guesthouse being edited
          editRoom: {
              id: null,
              name: '',
              type: 'standard',
              facilitiesList: [],
              total_slot: 1,
              area_m2: '',
              pricing: [],
              media: []
          },
          editRoomPhotos: [],
          editRoomPhotoPreviews: [],
          deletedRoomMedia: [],
          editRoomFacilityInput: '',
          selectedEditRoom: null,
      };

      
  },
  computed: {
      facilitiesList() {
          if (!this.selectedGuesthouse || !this.selectedGuesthouse.facilities) return [];
          return this.selectedGuesthouse.facilities.split(';').map(item => item.trim());
      }
  },
  methods: {
      formatCurrency(value) {
          return new Intl.NumberFormat('id-ID').format(value);
      },
      
      async fetchGuesthouses() {
          this.isLoading = true;
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              alert("Anda harus login terlebih dahulu!");
              this.isLoading = false;
              return;
          }

          try {
              const response = await axios.get(
                  'https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses',
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                  this.guesthouses = response.data.data;
              } else {
                  alert("Gagal mengambil data ruang mess.");
              }
          } catch (error) {
              console.error("Error fetching guesthouses:", error);
              alert("Terjadi kesalahan saat mengambil data.");
          } finally {
              this.isLoading = false;
          }
      },

      // Modal management
      openAddGuesthouseModal() {
        this.showAddGuesthouseModal = true;
        this.resetForms();
    },

        // untuk membuka slide show foto form tambah gedung mess
        openAddGuesthouseSlideshow(startIndex = 0) {
            this.currentAddGuesthouseSlideIndex = startIndex;
            this.showAddGuesthouseSlideshow = true;
        },

        // untuk membuka slide show foto form tambah ruang mess
        openAddRoomSlideshow(startIndex = 0) {
            this.currentAddRoomSlideIndex = startIndex;
            this.showAddRoomSlideshow = true;
        },

        // navigasi slideshow foto form tambah guesthouse
        nextAddGuesthouseSlide() {
            if (this.currentAddGuesthouseSlideIndex < this.guesthousePhotoPreviews.length - 1) {
                this.currentAddGuesthouseSlideIndex++;
            }
        },

        prevAddGuesthouseSlide() {
            if (this.currentAddGuesthouseSlideIndex > 0) {
                this.currentAddGuesthouseSlideIndex--;
            }
        },

        // navigasi slideshow foto form tambah room
        nextAddRoomSlide() {
            if (this.currentAddRoomSlideIndex < this.roomPhotoPreviews.length - 1) {
                this.currentAddRoomSlideIndex++;
            }
        },

        prevAddRoomSlide() {
            if (this.currentAddRoomSlideIndex > 0) {
                this.currentAddRoomSlideIndex--;
            }
        },
      
      closeAddGuesthouseModal() {
          this.showAddGuesthouseModal = false;
          this.resetForms();
      },
      
      resetForms() {
          // Reset all form data
          this.formStep = 1;
          this.createdGuesthouseId = null;
          
          // Reset guesthouse form
          this.newGuesthouse = {
              name: '',
              address: '',
              description: '',
              facilities: '',
              facilitiesList: [],
              area_m2: '',
              contact_person: '',
              latitude: '',
              longitude: '',
          };
          this.guesthousePhotos = [];
          this.guesthousePhotoPreviews = [];
          this.facilityInput = '';
          this.searchQuery = '';
          this.searchError = null;

            // Destroy existing map and marker
            if (this.map) {
                try {
                this.map.remove();
                this.map = null;
                } catch (error) {
                console.warn('Error destroying map in resetForms:', error);
                }
            }
          
          // Remove marker if exists
          if (this.marker) {
              this.marker.remove();
              this.marker = null;
          }
          
          // Reset room form
          this.newRoom = {
              name: '',
              type: 'standard',
              facilities: '',
              facilitiesList: [],
              total_slot: 1,
              area_m2: '',
              pricing: [
                  {
                      retribution_type: '',
                      price_per_day: '',
                      is_available: true
                  }
              ]
          };
          this.roomPhotos = [];
          this.roomPhotoPreviews = [];
          this.roomFacilityInput = '';
      },

      reinitializeEditMap() {
        console.log('Reinitializing edit map...');
        
        // Pastikan container ada
        const editMapContainer = document.getElementById('editMap');
        if (!editMapContainer) {
            console.warn('Edit map container not found, retrying...');
            setTimeout(() => this.reinitializeEditMap(), 200);
            return;
        }

        // Destroy existing edit map instance
        if (this.editMap) {
            try {
            this.editMap.remove();
            this.editMap = null;
            console.log('Existing edit map destroyed');
            } catch (error) {
            console.warn('Error destroying edit map:', error);
            }
        }

        // Hapus edit marker reference
        if (this.editMarker) {
            this.editMarker = null;
        }

        // Clear container content
        editMapContainer.innerHTML = '';

        // Initialize new edit map
        this.initEditMap();
    },
      
      goBackToStep1() {
        this.formStep = 1;
      },
      
      // Guesthouse photo management
      triggerPhotoInput() {
          this.$refs.photoInput.click();
      },
      
      handleGuesthousePhotoChange(event) {
          const files = event.target.files;
          if (!files.length) return;
          
          // Add new files to the array
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              this.guesthousePhotos.push(file);
              
              // Create and add preview URL
              const reader = new FileReader();
              reader.onload = (e) => {
                  this.guesthousePhotoPreviews.push(e.target.result);
              };
              reader.readAsDataURL(file);
          }
      },
      
      removeGuesthousePhoto(index) {
          this.guesthousePhotos.splice(index, 1);
          this.guesthousePhotoPreviews.splice(index, 1);
      },
      
      // Room photo management
      triggerRoomPhotoInput() {
          this.$refs.roomPhotoInput.click();
      },
      
      handleRoomPhotoChange(event) {
          const files = event.target.files;
          if (!files.length) return;
          
          // Add new files to the array
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              this.roomPhotos.push(file);
              
              // Create and add preview URL
              const reader = new FileReader();
              reader.onload = (e) => {
                  this.roomPhotoPreviews.push(e.target.result);
              };
              reader.readAsDataURL(file);
          }
      },
      
      removeRoomPhoto(index) {
          this.roomPhotos.splice(index, 1);
          this.roomPhotoPreviews.splice(index, 1);
      },
      
      // Facility management for guesthouse
      addFacility() {
          if (this.facilityInput.trim()) {
              this.newGuesthouse.facilitiesList.push(this.facilityInput.trim());
              this.facilityInput = '';
          }
      },
      
      removeFacility(index) {
          this.newGuesthouse.facilitiesList.splice(index, 1);
      },
      
      addQuickFacility(facility) {
          if (!this.newGuesthouse.facilitiesList.includes(facility)) {
              this.newGuesthouse.facilitiesList.push(facility);
          }
      },
      
      // Facility management for room
      addRoomFacility() {
          if (this.roomFacilityInput.trim()) {
              this.newRoom.facilitiesList.push(this.roomFacilityInput.trim());
              this.roomFacilityInput = '';
          }
      },
      
      removeRoomFacility(index) {
          this.newRoom.facilitiesList.splice(index, 1);
      },
      
      addQuickRoomFacility(facility) {
          if (!this.newRoom.facilitiesList.includes(facility)) {
              this.newRoom.facilitiesList.push(facility);
          }
      },
      
      // Pricing management
      addPricing() {
          this.newRoom.pricing.push({
              retribution_type: '',
              price_per_day: 0,
              is_available: true
          });
      },
      
      removePricing(index) {
          if (this.newRoom.pricing.length > 1) {
              this.newRoom.pricing.splice(index, 1);
          } else {
              alert('Minimal harus ada satu kategori harga sewa');
          }
      },
      
      // Map initialization and Nominatim search
      initMap() {
        if (!window.L) {
          // Load Leaflet script if not already loaded
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
          script.crossOrigin = '';
          document.head.appendChild(script);
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
          
          script.onload = () => {
            this.createMap();
          };
        } else {
          this.createMap();
        }
      },
      
      // Enhanced createMap method
      createMap() {
        // Make sure the map container exists before creating the map
        if (!document.getElementById('map')) {
          console.warn('Map container not found');
          // Try again in a moment
          setTimeout(() => this.createMap(), 200);
          return;
        }
        
        // Default coordinates (Jakarta)
        const defaultLat = -6.2088;
        const defaultLng = 106.8456;
        
        // Check if map already exists and destroy it to prevent duplicates
        if (this.map) {
          this.map.remove();
          this.map = null;
        }
        
        // Create map
        try {
          this.map = L.map('map').setView([defaultLat, defaultLng], 13);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);
          
          // Restore marker if coordinates exist
          if (this.newGuesthouse.latitude && this.newGuesthouse.longitude) {
            const lat = parseFloat(this.newGuesthouse.latitude);
            const lng = parseFloat(this.newGuesthouse.longitude);
            this.marker = L.marker([lat, lng]).addTo(this.map);
            this.map.setView([lat, lng], 15);
          }
          
          // Add click event to map
          this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Update marker position
            if (this.marker) {
              this.marker.setLatLng([lat, lng]);
            } else {
              this.marker = L.marker([lat, lng]).addTo(this.map);
            }
            
            // Update form fields
            this.newGuesthouse.latitude = lat.toFixed(10);
            this.newGuesthouse.longitude = lng.toFixed(10);
          });
          
          // Refresh map size to ensure it displays correctly
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 300);
        } catch (error) {
          console.error('Error creating map:', error);
        }
      },
      
      async searchLocation() {
          if (!this.searchQuery.trim()) {
              this.searchError = 'Silakan masukkan nama lokasi';
              return;
          }
          
          this.searchError = null;
          
          try {
              // Use Nominatim API (OpenStreetMap)
              const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                  params: {
                      q: this.searchQuery,
                      format: 'json',
                      limit: 1,  // Limit results to 1 location
                      addressdetails: 1
                  },
                  headers: {
                      'Accept-Language': 'id'  // Results in Indonesian
                  }
              });
              
              if (response.data && response.data.length > 0) {
                  const result = response.data[0];
                  const lat = parseFloat(result.lat);
                  const lng = parseFloat(result.lon);
                  
                  // Move map to found location
                  this.map.setView([lat, lng], 15);
                  
                  // Update marker
                  if (this.marker) {
                      this.marker.setLatLng([lat, lng]);
                  } else {
                      this.marker = L.marker([lat, lng]).addTo(this.map);
                  }
                  
                  // Update form coordinates
                  this.newGuesthouse.latitude = lat.toFixed(10);
                  this.newGuesthouse.longitude = lng.toFixed(10);
                  
                  // Optionally: Update address if not already filled
                  if (!this.newGuesthouse.address && result.display_name) {
                      this.newGuesthouse.address = result.display_name;
                  }
              } else {
                  this.searchError = 'Lokasi tidak ditemukan';
              }
          } catch (error) {
              console.error('Error searching location:', error);
              this.searchError = 'Terjadi kesalahan saat mencari lokasi. Coba lagi nanti.';
          }
      },
      
      // Form submission - Guesthouse
      async submitGuesthouseForm() {
        // Validate form
        if (this.newGuesthouse.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas utama');
          return;
        }
        
        if (this.guesthousePhotos.length === 0) {
          alert('Silakan upload minimal satu foto gedung');
          return;
        }
        
        // Validate map coordinates
        if (!this.newGuesthouse.latitude || !this.newGuesthouse.longitude) {
          alert('Silakan pilih lokasi pada peta');
          return;
        }
        
        // Instead of submitting to API now, just move to step 2
        this.formStep = 2;
        
        // Re-render the map when going back to step 1
        this.$nextTick(() => {
          if (this.map) {
            setTimeout(() => {
              this.map.invalidateSize();
            }, 100);
          }
        });
      },
      
      // Form submission - Room
      async submitRoomForm() {
        // Validate form
        if (this.newRoom.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas ruang');
          return;
        }
        
        if (this.newRoom.pricing.some(p => !p.retribution_type.trim() || !p.price_per_day)) {
          alert('Silakan lengkapi semua kategori dan harga sewa');
          return;
        }
        
        // Set loading state
        this.isSubmittingRoom = true;
        
        try {
          // Get token
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // STEP 1: First submit the guesthouse data
          const guesthouseFormData = new FormData();
          guesthouseFormData.append('name', this.newGuesthouse.name);
          guesthouseFormData.append('description', this.newGuesthouse.description);
          guesthouseFormData.append('facilities', this.newGuesthouse.facilitiesList.join('; '));
          guesthouseFormData.append('area_m2', this.newGuesthouse.area_m2);
          guesthouseFormData.append('address', this.newGuesthouse.address);
          guesthouseFormData.append('latitude', this.newGuesthouse.latitude);
          guesthouseFormData.append('longitude', this.newGuesthouse.longitude);
          guesthouseFormData.append('contact_person', this.newGuesthouse.contact_person);
          
          // Add all guesthouse photos
          this.guesthousePhotos.forEach(photo => {
            guesthouseFormData.append('guesthouse_media', photo);
          });
          
          // Submit guesthouse data
          const guesthouseResponse = await axios.post(
            'https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses',
            guesthouseFormData,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (!guesthouseResponse.data.status) {
            throw new Error(guesthouseResponse.data.message || 'Failed to create guesthouse');
          }
          
          // Get the created guesthouse ID
          const createdGuesthouseId = guesthouseResponse.data.data.id;
          
          // STEP 2: Now submit the room data
          const roomFormData = new FormData();
          roomFormData.append('name', this.newRoom.name);
          roomFormData.append('type', this.newRoom.type);
          roomFormData.append('facilities', this.newRoom.facilitiesList.join('; '));
          roomFormData.append('total_slot', this.newRoom.total_slot);
          roomFormData.append('area_m2', this.newRoom.area_m2);
          
          // Add pricing data as JSON string
          roomFormData.append('room_pricing', JSON.stringify(this.newRoom.pricing));
          
          // Add room photos if any
          this.roomPhotos.forEach(photo => {
            roomFormData.append('room_media', photo);
          });
          
          // Submit room form
          const roomResponse = await axios.post(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${createdGuesthouseId}/rooms`,
            roomFormData,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (roomResponse.data.status) {
            // Success! Close modal and refresh data
            this.closeAddGuesthouseModal();
            this.fetchGuesthouses(); // Refresh the guesthouse list
            alert('Gedung mess dan ruang berhasil ditambahkan!');
          } else {
            throw new Error(roomResponse.data.message || 'Failed to create room');
          }
        } catch (error) {
          console.error('Error creating guesthouse and room:', error);
          alert(`Gagal: ${error.message || 'Terjadi kesalahan saat menyimpan data'}`);
        } finally {
          this.isSubmittingRoom = false;
        }
      },
      
      // Improve map initialization to ensure it's properly displayed
      // initMap() {
      //   if (!window.L) {
      //     // Load Leaflet script if not already loaded
      //     const script = document.createElement('script');
      //     script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      //     script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
      //     script.crossOrigin = '';
      //     document.head.appendChild(script);
          
      //     const link = document.createElement('link');
      //     link.rel = 'stylesheet';
      //     link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      //     link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
      //     link.crossOrigin = '';
      //     document.head.appendChild(link);
          
      //     script.onload = () => {
      //       this.createMap();
      //     };
      //   } else {
      //     this.createMap();
      //   }
      // },
      
      async fetchRoomData(guesthouseId) {
          this.isLoadingRooms = true;
          this.rooms = [];
          
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              this.isLoadingRooms = false;
              return;
          }
          
          try {
              // Coba gunakan endpoint koleksi terlebih dahulu (jika tersedia)
              try {
                  console.log(`Trying to fetch all rooms for guesthouse ${guesthouseId}`);
                  const response = await axios.get(
                      `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms`,
                      { headers: { Authorization: `Bearer ${token}` } }
                  );
                  
                  if (response.data.status && Array.isArray(response.data.data)) {
                      this.rooms = response.data.data;
                      console.log(`Successfully fetched ${this.rooms.length} rooms from collection endpoint`);
                  } else {
                      // Fallback ke metode sekuensial adaptif
                      await this.fetchRoomsSequentially(guesthouseId);
                  }
              } catch (error) {
                  console.warn("Collection endpoint failed, using sequential approach:", error);
                  // Fallback ke metode sekuensial adaptif
                  await this.fetchRoomsSequentially(guesthouseId);
              }
              
              // Setelah mendapatkan ruang, ambil ulasannya
              if (this.rooms.length > 0) {
                  await this.fetchReviews(guesthouseId);
              }
          } catch (error) {
              console.error("Error fetching rooms:", error);
          } finally {
              this.isLoadingRooms = false;
          }
      },

      // Metode adaptif untuk mengambil ruang secara sekuensial tanpa batas tetap
      async fetchRoomsSequentially(guesthouseId) {
          const token = localStorage.getItem('authToken');
          if (!token) return;
          
          try {
              const roomsData = [];
              let roomId = 1;
              let consecutiveErrors = 0;
              const maxConsecutiveErrors = 3; // Berhenti setelah 3 error 404 berturut-turut
              
              console.log(`Starting sequential room fetching for guesthouse ${guesthouseId}`);
              
              while (consecutiveErrors < maxConsecutiveErrors) {
                  try {
                      const response = await axios.get(
                          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms/${roomId}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                      );
                      
                      if (response.data.status) {
                          const roomData = response.data.data;
                          
                          // Verifikasi bahwa ruang ini memang milik guesthouse yang diminta
                          if (!roomData.guesthouse_id || roomData.guesthouse_id == guesthouseId) {
                              roomsData.push(roomData);
                              console.log(`Added room ${roomId} to results`);
                              consecutiveErrors = 0; // Reset penghitung error
                          } else {
                              console.warn(`Room ${roomId} belongs to guesthouse ${roomData.guesthouse_id}, not ${guesthouseId}`);
                              consecutiveErrors++; // Hitung sebagai error karena ini data yang salah
                          }
                      }
                  } catch (error) {
                      if (error.response && error.response.status === 404) {
                          consecutiveErrors++;
                          console.log(`Room ${roomId} not found, consecutive errors: ${consecutiveErrors}`);
                      } else {
                          console.error(`Error fetching room ${roomId}:`, error);
                          // Jangan tingkatkan consecutiveErrors untuk error selain 404
                      }
                  }
                  
                  roomId++; // Coba ID ruang berikutnya
              }
              
              console.log(`Finished sequential fetch, found ${roomsData.length} rooms`);
              this.rooms = roomsData;
          } catch (error) {
              console.error("Error in sequential room fetching:", error);
          }
      },

      // Metode adaptif untuk mengambil ruang secara sekuensial tanpa batas tetap
      async fetchRoomsSequentially(guesthouseId) {
          const token = localStorage.getItem('authToken');
          if (!token) return;
          
          try {
              const roomsData = [];
              let roomId = 1;
              let consecutiveErrors = 0;
              const maxConsecutiveErrors = 3; // Berhenti setelah 3 error 404 berturut-turut
              
              console.log(`Starting sequential room fetching for guesthouse ${guesthouseId}`);
              
              while (consecutiveErrors < maxConsecutiveErrors) {
                  try {
                      const response = await axios.get(
                          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms/${roomId}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                      );
                      
                      if (response.data.status) {
                          const roomData = response.data.data;
                          
                          // Verifikasi bahwa ruang ini memang milik guesthouse yang diminta
                          if (!roomData.guesthouse_id || roomData.guesthouse_id == guesthouseId) {
                              roomsData.push(roomData);
                              console.log(`Added room ${roomId} to results`);
                              consecutiveErrors = 0; // Reset penghitung error
                          } else {
                              console.warn(`Room ${roomId} belongs to guesthouse ${roomData.guesthouse_id}, not ${guesthouseId}`);
                              consecutiveErrors++; // Hitung sebagai error karena ini data yang salah
                          }
                      }
                  } catch (error) {
                      if (error.response && error.response.status === 404) {
                          consecutiveErrors++;
                          console.log(`Room ${roomId} not found, consecutive errors: ${consecutiveErrors}`);
                      } else {
                          console.error(`Error fetching room ${roomId}:`, error);
                          // Jangan tingkatkan consecutiveErrors untuk error selain 404
                      }
                  }
                  
                  roomId++; // Coba ID ruang berikutnya
              }
              
              console.log(`Finished sequential fetch, found ${roomsData.length} rooms`);
              this.rooms = roomsData;
          } catch (error) {
              console.error("Error in sequential room fetching:", error);
          }
      },
      
      async showGuesthouseDetail(id) {
        console.log('Detail button clicked, ID:', id);

        this.selectedGuesthouse = null;
        this.rooms = [];
        this.reviews = []; // Reset reviews
        this.isLoadingDetail = true;
        this.showModal = true;

        // debug
        // try {
        //     await this.fetchGuesthouseDetailData(id);
        // } catch (error) {
        //     console.error('Error showing guesthouse detail:', error);
        //     this.isLoadingDetail = false;
        //     this.showModal = false;
        // }
        
        // fetch data
        this.fetchGuesthouseDetailData(id);
      },

      // Method to fetch guesthouse detail data
      async fetchGuesthouseDetailData(id) {
          const token = localStorage.getItem('authToken');

          if (!token) {
              alert("Anda harus login terlebih dahulu!");
              this.showModal = false;
              this.isLoadingDetail = false;
              return;
          }

          try {
              // Fetch guesthouse details
              const response = await axios.get(
                  `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.status) {
                  this.selectedGuesthouse = response.data.data;
                  
                  // Fetch room data for this guesthouse
                  await this.fetchRoomData(id);
              } else {
                  alert("Gagal mengambil detail ruang mess.");
                  this.showModal = false;
              }
          } catch (error) {
              console.error("Error fetching guesthouse detail:", error);
              alert("Terjadi kesalahan saat mengambil detail ruang mess.");
              this.showModal = false;
          } finally {
              this.isLoadingDetail = false;
          }
      },
      
      // fungsi untuk fetch review
      async fetchReviews(guesthouseId) {
          this.isLoadingReviews = true;
          this.reviews = []; 
          
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              this.isLoadingReviews = false;
              return;
          }
          
          try {
              const allReviews = [];
              
              console.log(`Fetching reviews for ${this.rooms.length} rooms of guesthouse ${guesthouseId}`);
              
              for (const room of this.rooms) {
                  // Verifikasi bahwa room adalah dari guesthouse yang benar
                  if (room.guesthouse_id && parseInt(room.guesthouse_id) !== parseInt(guesthouseId)) {
                      console.warn(`Skipping reviews for room ${room.id} - belongs to guesthouse ${room.guesthouse_id}, not ${guesthouseId}`);
                      continue;
                  }
                  
                  try {
                      const response = await axios.get(
                          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms/${room.id}/reviews`,
                          { headers: { Authorization: `Bearer ${token}` } }
                      );
                      
                      if (response.data.status && Array.isArray(response.data.data) && response.data.data.length > 0) {
                          // Tambahkan info room ke setiap review
                          const roomReviews = response.data.data.map(review => ({
                              ...review,
                              roomId: room.id,
                              roomName: room.name,
                              guesthouseId: guesthouseId // Simpan guesthouse ID untuk validasi
                          }));
                          
                          allReviews.push(...roomReviews);
                          console.log(`Found ${roomReviews.length} reviews for room ${room.id}`);
                      }
                  } catch (error) {
                      console.error(`Error fetching reviews for room ${room.id}:`, error);
                  }
              }
              
              if (allReviews.length > 0) {
                  const processedReviews = await this.processReviewsWithAdminData(allReviews);
                  this.reviews = processedReviews;
              }
          } catch (error) {
              console.error("Error fetching reviews:", error);
          } finally {
              this.isLoadingReviews = false;
          }
      },
      
      // Fetch admin details by ID
      async fetchAdminData(adminId) {
          if (this.admins[adminId]) {
              // Return cached data if already fetched
              return this.admins[adminId];
          }
          
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              console.error("No authentication token found");
              return null;
          }
          
          try {
              const response = await axios.get(
                  `https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/${adminId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                  // Store admin data in cache
                  this.admins[adminId] = response.data.data;
                  return response.data.data;
              } else {
                  console.error("Failed to fetch admin data:", response.data.message);
                  return null;
              }
          } catch (error) {
              console.error(`Error fetching admin data for ID ${adminId}:`, error);
              return null;
          }
      },

      // Process reviews to add admin data
      async processReviewsWithAdminData(reviews) {
          if (!reviews || reviews.length === 0) return [];
          
          // Collect all unique adminIds from review replies
          const adminIds = reviews
              .filter(review => review.review_reply)
              .map(review => review.review_reply.adminId)
              .filter((id, index, self) => self.indexOf(id) === index); // Get unique IDs
          
          // Fetch admin data for all needed admins
          this.isLoadingAdmins = true;
          const fetchPromises = adminIds.map(adminId => this.fetchAdminData(adminId));
          await Promise.all(fetchPromises);
          this.isLoadingAdmins = false;
          
          // Return the reviews as is - we'll use the cached admin data when rendering
          return reviews;
      },

      // Get admin name for a review reply
      getAdminName(adminId) {
          if (!adminId) return 'Admin';
          return this.admins[adminId]?.fullname || 'Admin';
      },
      
      // format tanggal review
      formatReviewDate(dateString) {
          const date = new Date(dateString);
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          return date.toLocaleDateString('id-ID', options);
      },
      
      // Toggle reply form
      toggleReplyForm(reviewId) {
          if (this.activeReplyId === reviewId) {
              this.activeReplyId = null; // Close form
              this.replyText = '';
          } else {
              this.activeReplyId = reviewId; // Open form
              this.replyText = '';
          }
      },
      
      // Submit reply to a review
      async submitReply(rentId, reviewId) {
          if (!this.replyText.trim()) {
              alert('Silakan masukkan balasan terlebih dahulu');
              return;
          }
          
          this.isSubmittingReply = true;
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              alert("Anda harus login terlebih dahulu!");
              this.isSubmittingReply = false;
              return;
          }
          
          try {
              const response = await axios.post(
                  `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents/${rentId}/reviews/${reviewId}/replies`,
                  { comment: this.replyText },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                  const replyData = response.data.data;
                  
                  // Fetch admin data for the new reply
                  await this.fetchAdminData(replyData.adminId);
                  
                  // Update the review with the new reply
                  const reviewIndex = this.reviews.findIndex(review => review.id === reviewId);
                  if (reviewIndex !== -1) {
                      // Create a new review object with the reply data
                      const updatedReview = {
                          ...this.reviews[reviewIndex],
                          review_reply: replyData
                      };
                      
                      // Update the reviews array
                      this.reviews.splice(reviewIndex, 1, updatedReview);
                  }
                  
                  // Reset form state
                  this.activeReplyId = null;
                  this.replyText = '';
                  
                  alert('Balasan berhasil dikirim!');
              } else {
                  alert(response.data.message || 'Gagal mengirim balasan.');
              }
          } catch (error) {
              console.error("Error submitting reply:", error);
              const errorMessage = error.response?.data?.message || 'Gagal mengirim balasan. Coba lagi nanti.';
              alert(errorMessage);
          } finally {
              this.isSubmittingReply = false;
          }
      },
      
      // Show edit reply form
      showEditReplyForm(review) {
          this.activeEditReplyId = review.id;
          this.editReplyText = review.review_reply.comment;
      },
      
      // Cancel edit reply
      cancelEditReply() {
          this.activeEditReplyId = null;
          this.editReplyText = '';
      },
      
      // Update an existing reply
      async updateReply(rentId, reviewId, replyId) {
          if (!this.editReplyText.trim()) {
              alert('Silakan masukkan balasan terlebih dahulu');
              return;
          }
          
          this.isUpdatingReply = true;
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              alert("Anda harus login terlebih dahulu!");
              this.isUpdatingReply = false;
              return;
          }
          
          try {
              const response = await axios.put(
                  `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents/${rentId}/reviews/${reviewId}/replies/${replyId}`,
                  { comment: this.editReplyText },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                  // Find the review to update
                  const reviewIndex = this.reviews.findIndex(review => review.id === reviewId);
                  if (reviewIndex !== -1) {
                      // Create a new updated review object
                      const updatedReview = {
                          ...this.reviews[reviewIndex],
                          review_reply: {
                              ...this.reviews[reviewIndex].review_reply,
                              comment: this.editReplyText,
                              updatedAt: new Date().toISOString() // Update timestamp
                          }
                      };
                      
                      // Update the reviews array with the new review
                      this.reviews.splice(reviewIndex, 1, updatedReview);
                  }
                  
                  // Reset edit state
                  this.cancelEditReply();
                  
                  alert('Balasan berhasil diperbarui!');
              } else {
                  alert(response.data.message || 'Gagal memperbarui balasan.');
              }
          } catch (error) {
              console.error("Error updating reply:", error);
              const errorMessage = error.response?.data?.message || 'Gagal memperbarui balasan. Coba lagi nanti.';
              alert(errorMessage);
          } finally {
              this.isUpdatingReply = false;
          }
      },
      
      // Confirm delete reply
      confirmDeleteReply(reviewId) {
          this.isConfirmingReplyDelete = reviewId;
      },
      
      // Cancel delete reply
      cancelDeleteReply() {
          this.isConfirmingReplyDelete = null;
      },
      
      // Delete an existing reply
      async deleteReply(rentId, reviewId) {
          const token = localStorage.getItem('authToken');
          
          if (!token) {
              alert("Anda harus login terlebih dahulu!");
              return;
          }
          
          // Find the review to get the reply ID
          const review = this.reviews.find(r => r.id === reviewId);
          if (!review || !review.review_reply) {
              alert('Balasan tidak ditemukan.');
              this.isConfirmingReplyDelete = null;
              return;
          }
          
          const replyId = review.review_reply.id;
          
          // Set loading state
          this.isDeletingReply = true;
          
          try {
              const response = await axios.delete(
                  `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents/${rentId}/reviews/${reviewId}/replies/${replyId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                  // Find the review and remove its reply
                  const reviewIndex = this.reviews.findIndex(review => review.id === reviewId);
                  if (reviewIndex !== -1) {
                      // Create a new review object without the reply
                      const updatedReview = { ...this.reviews[reviewIndex] };
                      delete updatedReview.review_reply;
                      
                      // Update the reviews array
                      this.reviews.splice(reviewIndex, 1, updatedReview);
                  }
                  
                  alert('Balasan berhasil dihapus!');
              } else {
                  alert(response.data.message || 'Gagal menghapus balasan.');
              }
          } catch (error) {
              console.error("Error deleting reply:", error);
              const errorMessage = error.response?.data?.message || 'Gagal menghapus balasan. Coba lagi nanti.';
              alert(errorMessage);
          } finally {
              this.isDeletingReply = false;
              this.isConfirmingReplyDelete = null;
          }
      },

      // membuka modal form edit
      openEditGuesthouseModal(guesthouse) {
        this.editGuesthouseId = guesthouse.id;
        this.showEditGuesthouseModal = true;
        this.editFormStep = 1;
        
        // Load guesthouse details
        this.loadGuesthouseForEdit(guesthouse.id);
        },
      
      // Navigate back to step 1 in edit form
      goBackToEditStep1() {
        this.editFormStep = 1;
        
        // Re-render the map when returning to step 1
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.editMap) {
              this.editMap.invalidateSize();
            } else {
              this.initEditMap();
            }
          }, 300);
        });
      },
      
      // Proceed to step 2 without submitting
      proceedToEditStep2() {
        // Validate form
        if (this.editGuesthouse.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas utama');
          return;
        }
        
        if (this.editGuesthousePhotoPreviews.length === 0) {
          alert('Silakan upload minimal satu foto gedung');
          return;
        }
        
        // Validate map coordinates
        if (!this.editGuesthouse.latitude || !this.editGuesthouse.longitude) {
          alert('Silakan pilih lokasi pada peta');
          return;
        }
        
        // Move to step 2
        this.editFormStep = 2;
      },
      
      // Load guesthouse data for editing
      async loadGuesthouseForEdit(guesthouseId) {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          alert("Anda harus login terlebih dahulu!");
          this.showEditGuesthouseModal = false;
          return;
        }
        
        try {
          // Fetch guesthouse details
          const response = await axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.status) {
            const guesthouse = response.data.data;
            
            // Initialize edit guesthouse data
            this.editGuesthouse = {
              id: guesthouse.id,
              name: guesthouse.name,
              address: guesthouse.address,
              description: guesthouse.description,
              facilitiesList: guesthouse.facilities ? guesthouse.facilities.split(';').map(item => item.trim()) : [],
              area_m2: guesthouse.area_m2,
              contact_person: guesthouse.contact_person,
              latitude: guesthouse.latitude,
              longitude: guesthouse.longitude,
              media: guesthouse.guesthouse_media || []
            };
            
            // Set up photo previews
            this.editGuesthousePhotoPreviews = (guesthouse.guesthouse_media || []).map(media => media.url);
            this.deletedGuesthouseMedia = [];
            
            // Fetch rooms for this guesthouse
            await this.loadRoomsForEdit(guesthouseId);
            
            // Set the map location
            this.$nextTick(() => {
              this.setEditMapLocation(guesthouse.latitude, guesthouse.longitude);
            });
          } else {
            alert("Gagal mengambil detail ruang mess untuk pengeditan.");
            this.showEditGuesthouseModal = false;
          }
        } catch (error) {
          console.error("Error fetching guesthouse for edit:", error);
          alert("Terjadi kesalahan saat mengambil data gedung mess.");
          this.showEditGuesthouseModal = false;
        }
      },
      
      // Load rooms for the guesthouse being edited
      async loadRoomsForEdit(guesthouseId) {
        const token = localStorage.getItem('authToken');
        
        if (!token) return;
        
        try {
          // Try to fetch all rooms
          const response = await axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.status && Array.isArray(response.data.data)) {
            this.editRooms = response.data.data;
          } else {
            // Fallback to sequential fetching if bulk endpoint fails
            await this.loadRoomsSequentiallyForEdit(guesthouseId);
          }
        } catch (error) {
          console.warn("Collection endpoint failed for edit, using sequential approach:", error);
          // Fallback to sequential fetching
          await this.loadRoomsSequentiallyForEdit(guesthouseId);
        }
      },
      
      // Sequentially load rooms for edit (fallback method)
      async loadRoomsSequentiallyForEdit(guesthouseId) {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        try {
          const roomsData = [];
          let roomId = 1;
          let consecutiveErrors = 0;
          const maxConsecutiveErrors = 3;
          
          while (consecutiveErrors < maxConsecutiveErrors) {
            try {
              const response = await axios.get(
                `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}/rooms/${roomId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.status) {
                const roomData = response.data.data;
                
                if (!roomData.guesthouse_id || parseInt(roomData.guesthouse_id) == parseInt(guesthouseId)) {
                  roomsData.push(roomData);
                  consecutiveErrors = 0;
                } else {
                  consecutiveErrors++;
                }
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                consecutiveErrors++;
              }
            }
            
            roomId++;
          }
          
          this.editRooms = roomsData;
        } catch (error) {
          console.error("Error in sequential room fetching for edit:", error);
        }
      },
      
      // Select a room for editing
      selectRoomForEdit(room) {
        // Clone the room data to avoid direct mutation
        this.selectedEditRoom = { ...room };
        this.editRoom = {
          id: room.id,
          name: room.name,
          type: room.type,
          facilitiesList: room.facilities ? room.facilities.split(';').map(item => item.trim()) : [],
          total_slot: room.total_slot,
          area_m2: room.area_m2,
          pricing: JSON.parse(JSON.stringify(room.pricing || [])),
          media: room.media || []
        };
        
        // Set up photo previews
        this.editRoomPhotoPreviews = (room.media || []).map(media => media.url);
        this.editRoomPhotos = [];
        this.deletedRoomMedia = [];

        // Ensure modal is visible and scrollable
        this.ensureModalVisibility();
      },
      
      // Close the edit room form
      closeEditRoomForm() {
        this.selectedEditRoom = null;
        this.editRoom = {
          id: null,
          name: '',
          type: 'standard',
          facilitiesList: [],
          total_slot: 1,
          area_m2: '',
          pricing: [],
          media: []
        };
        this.editRoomPhotos = [];
        this.editRoomPhotoPreviews = [];
        this.deletedRoomMedia = [];
      },
      
      // Close the edit guesthouse modal
      closeEditGuesthouseModal() {
        this.showEditGuesthouseModal = false;
        
        // Reset form data
        this.editGuesthouseId = null;
        this.editGuesthouse = {
          id: null,
          name: '',
          address: '',
          description: '',
          facilities: '',
          facilitiesList: [],
          area_m2: '',
          contact_person: '',
          latitude: '',
          longitude: '',
          media: []
        };
        this.editGuesthousePhotos = [];
        this.editGuesthousePhotoPreviews = [];
        this.deletedGuesthouseMedia = [];
        this.editRooms = [];
        this.closeEditRoomForm();
        
        // Remove map marker if exists
        if (this.editMarker) {
          this.editMarker.remove();
          this.editMarker = null;
        }
        
        // Destroy map instance
        if (this.editMap) {
          this.editMap.remove();
          this.editMap = null;
        }
      },

      // Memastikan modal dapat di-scroll dan terlihat dengan baik
    ensureModalVisibility() {
      // Reset scroll pada body
      document.body.style.overflow = '';
      
      // Focus pada form input pertama setelah modal muncul
      this.$nextTick(() => {
        const firstInput = document.getElementById('editRoomName');
        if (firstInput) {
          setTimeout(() => {
            firstInput.focus();
          }, 100);
        }
        
        // Pastikan scroll bekerja dengan benar
        const modalContent = document.querySelector('.max-h-\\[90vh\\]');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      });
    },
      
      // Initialize map for edit form
      initEditMap() {
        if (!window.L) {
          // Load Leaflet script if not already loaded
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
          script.crossOrigin = '';
          document.head.appendChild(script);
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
          
          script.onload = () => {
            this.createEditMap();
          };
        } else {
          this.createEditMap();
        }
      },
      
      // Create map for edit form
      createEditMap() {
        // Make sure the map container exists
        if (!document.getElementById('editMap')) {
          console.warn('Edit map container not found');
          setTimeout(() => this.createEditMap(), 200);
          return;
        }
        
        // Default coordinates (Jakarta)
        const defaultLat = -6.2088;
        const defaultLng = 106.8456;
        
        // Check if map already exists and remove it
        if (this.editMap) {
          this.editMap.remove();
          this.editMap = null;
        }
        
        // Create map
        try {
          this.editMap = L.map('editMap').setView([defaultLat, defaultLng], 13);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.editMap);
          
          // Restore marker if coordinates exist
          if (this.editGuesthouse.latitude && this.editGuesthouse.longitude) {
            const lat = parseFloat(this.editGuesthouse.latitude);
            const lng = parseFloat(this.editGuesthouse.longitude);
            this.editMarker = L.marker([lat, lng]).addTo(this.editMap);
            this.editMap.setView([lat, lng], 15);
          }
          
          // Add click event to map
          this.editMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Update marker position
            if (this.editMarker) {
              this.editMarker.setLatLng([lat, lng]);
            } else {
              this.editMarker = L.marker([lat, lng]).addTo(this.editMap);
            }
            
            // Update form fields
            this.editGuesthouse.latitude = lat.toFixed(10);
            this.editGuesthouse.longitude = lng.toFixed(10);
          });
          
          // Refresh map size
          setTimeout(() => {
            if (this.editMap) {
              this.editMap.invalidateSize();
            }
          }, 300);
        } catch (error) {
          console.error('Error creating edit map:', error);
        }
      },
      
      // Set map location for edit form
      setEditMapLocation(latitude, longitude) {
        if (!this.editMap) return;
        
        // If valid coordinates are provided
        if (latitude && longitude) {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          
          // Move map to the location
          this.editMap.setView([lat, lng], 15);
          
          // Add/update marker
          if (this.editMarker) {
            this.editMarker.setLatLng([lat, lng]);
          } else {
            this.editMarker = L.marker([lat, lng]).addTo(this.editMap);
          }
        }
        
        // Refresh map to ensure proper display
        this.editMap.invalidateSize();
      },
      
      // Search location for edit form
      async searchEditLocation() {
        if (!this.editSearchQuery.trim()) {
          this.editSearchError = 'Silakan masukkan nama lokasi';
          return;
        }
        
        this.editSearchError = null;
        
        try {
          // Use Nominatim API (OpenStreetMap)
          const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
              q: this.editSearchQuery,
              format: 'json',
              limit: 1,
              addressdetails: 1
            },
            headers: {
              'Accept-Language': 'id'
            }
          });
          
          if (response.data && response.data.length > 0) {
            const result = response.data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            // Move map to found location
            this.editMap.setView([lat, lng], 15);
            
            // Update marker
            if (this.editMarker) {
              this.editMarker.setLatLng([lat, lng]);
            } else {
              this.editMarker = L.marker([lat, lng]).addTo(this.editMap);
            }
            
            // Update form coordinates
            this.editGuesthouse.latitude = lat.toFixed(10);
            this.editGuesthouse.longitude = lng.toFixed(10);
            
            // Optionally: Update address if not already filled
            if (!this.editGuesthouse.address && result.display_name) {
              this.editGuesthouse.address = result.display_name;
            }
          } else {
            this.editSearchError = 'Lokasi tidak ditemukan';
          }
        } catch (error) {
          console.error('Error searching location for edit:', error);
          this.editSearchError = 'Terjadi kesalahan saat mencari lokasi. Coba lagi nanti.';
        }
      },
      
      // Guesthouse photo management for edit form
      triggerEditPhotoInput() {
        this.$refs.editPhotoInput.click();
      },
      
      handleEditGuesthousePhotoChange(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        // Add new files to the array
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          this.editGuesthousePhotos.push(file);
          
          // Create and add preview URL
          const reader = new FileReader();
          reader.onload = (e) => {
            this.editGuesthousePhotoPreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      },
      
      removeEditGuesthousePhoto(index) {
        // Check if it's an existing photo or a new one
        const existingMediaLength = this.editGuesthouse.media.length;
        
        if (index < existingMediaLength) {
          // It's an existing photo, mark it for deletion
          this.deletedGuesthouseMedia.push(this.editGuesthouse.media[index]);
          
          // Remove from the media array and preview
          this.editGuesthouse.media.splice(index, 1);
          this.editGuesthousePhotoPreviews.splice(index, 1);
        } else {
          // It's a new photo, just remove it from arrays
          const newPhotoIndex = index - existingMediaLength;
          this.editGuesthousePhotos.splice(newPhotoIndex, 1);
          this.editGuesthousePhotoPreviews.splice(index, 1);
        }
      },
      
      // Room photo management for edit form
      triggerEditRoomPhotoInput() {
        this.$refs.editRoomPhotoInput.click();
      },
      
      handleEditRoomPhotoChange(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        // Add new files to the array
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          this.editRoomPhotos.push(file);
          
          // Create and add preview URL
          const reader = new FileReader();
          reader.onload = (e) => {
            this.editRoomPhotoPreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      },
      
      removeEditRoomPhoto(index) {
        // Check if it's an existing photo or a new one
        const existingMediaLength = this.editRoom.media.length;
        
        if (index < existingMediaLength) {
          // It's an existing photo, mark it for deletion
          this.deletedRoomMedia.push(this.editRoom.media[index]);
          
          // Remove from the media array and preview
          this.editRoom.media.splice(index, 1);
          this.editRoomPhotoPreviews.splice(index, 1);
        } else {
          // It's a new photo, just remove it from arrays
          const newPhotoIndex = index - existingMediaLength;
          this.editRoomPhotos.splice(newPhotoIndex, 1);
          this.editRoomPhotoPreviews.splice(index, 1);
        }
      },
      
      // Facility management for edit guesthouse
      addEditFacility() {
        if (this.editFacilityInput.trim()) {
          this.editGuesthouse.facilitiesList.push(this.editFacilityInput.trim());
          this.editFacilityInput = '';
        }
      },
      
      removeEditFacility(index) {
        this.editGuesthouse.facilitiesList.splice(index, 1);
      },
      
      addEditQuickFacility(facility) {
        if (!this.editGuesthouse.facilitiesList.includes(facility)) {
          this.editGuesthouse.facilitiesList.push(facility);
        }
      },
      
      // Facility management for edit room
      addEditRoomFacility() {
        if (this.editRoomFacilityInput.trim()) {
          this.editRoom.facilitiesList.push(this.editRoomFacilityInput.trim());
          this.editRoomFacilityInput = '';
        }
      },
      
      removeEditRoomFacility(index) {
        this.editRoom.facilitiesList.splice(index, 1);
      },
      
      // Pricing management for edit room
      addEditPricing() {
        this.editRoom.pricing.push({
          id: 0, // 0 indicates new pricing
          retribution_type: '',
          price_per_day: 0,
          is_available: true
        });
      },
      
      removeEditPricing(index) {
        if (this.editRoom.pricing.length > 1) {
          this.editRoom.pricing.splice(index, 1);
        } else {
          alert('Minimal harus ada satu kategori harga sewa');
        }
      },
      
      // Submit the edited guesthouse
      async submitEditGuesthouseForm() {
        // Validate form
        if (this.editGuesthouse.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas utama');
          return;
        }
        
        if (this.editGuesthousePhotoPreviews.length === 0) {
          alert('Silakan upload minimal satu foto gedung');
          return;
        }
        
        // Validate map coordinates
        if (!this.editGuesthouse.latitude || !this.editGuesthouse.longitude) {
          alert('Silakan pilih lokasi pada peta');
          return;
        }
        
        // Set loading state
        this.isSubmittingEditGuesthouse = true;
        
        try {
          // Prepare form data for submission
          const formData = new FormData();
          formData.append('name', this.editGuesthouse.name);
          formData.append('description', this.editGuesthouse.description);
          formData.append('facilities', this.editGuesthouse.facilitiesList.join('; '));
          formData.append('area_m2', this.editGuesthouse.area_m2);
          formData.append('address', this.editGuesthouse.address);
          formData.append('latitude', this.editGuesthouse.latitude);
          formData.append('longitude', this.editGuesthouse.longitude);
          formData.append('contact_person', this.editGuesthouse.contact_person);
          
          // Add all new photos
          this.editGuesthousePhotos.forEach(photo => {
            formData.append('guesthouse_media', photo);
          });
          
          // Add deleted media if any
          if (this.deletedGuesthouseMedia.length > 0) {
            formData.append('deleted_media', JSON.stringify(this.deletedGuesthouseMedia));
          }
          
          // Get token
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // Submit form
          const response = await axios.put(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${this.editGuesthouseId}`,
            formData,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (response.data.status) {
            // Success! Close modal and refresh data
            this.closeEditGuesthouseModal();
            this.fetchGuesthouses(); // Refresh the guesthouse list
            alert('Gedung mess berhasil diperbarui!');
          } else {
            throw new Error(response.data.message || 'Failed to update guesthouse');
          }
        } catch (error) {
          console.error('Error updating guesthouse:', error);
          alert(`Gagal memperbarui gedung mess: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
          this.isSubmittingEditGuesthouse = false;
        }
      },
      
      // Add additional room to the guesthouse
      addRoomToGuesthouse() {
        // Initialize new room form
        this.editRoom = {
          id: null,
          name: '',
          type: 'standard',
          facilitiesList: [],
          total_slot: 1,
          area_m2: '',
          pricing: [{
            id: 0,
            retribution_type: '',
            price_per_day: '',
            is_available: true
          }],
          media: []
        };
        this.editRoomPhotos = [];
        this.editRoomPhotoPreviews = [];
        this.deletedRoomMedia = [];
        
        // Set selectedEditRoom to null but with a flag to indicate it's a new room
        this.selectedEditRoom = { isNew: true };

        // Ensure modal is visible and scrollable
        this.ensureModalVisibility();
      },
      
      // Submit edited room
      async submitEditRoomForm() {
        // Validasi form
        if (this.editRoom.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas ruang');
          return;
        }
        
        if (this.editRoom.pricing.some(p => !p.retribution_type.trim() || !p.price_per_day)) {
          alert('Silakan lengkapi semua kategori dan harga sewa');
          return;
        }
        
        // Set loading state
        this.isSubmittingEditRoom = true;
        
        try {
          // Perbaikan pada format pricing data
          const formattedPricing = this.editRoom.pricing.map(p => {
            // Pisahkan pricing yang baru dan yang sudah ada
            if (p.id && p.id !== 0) {
              // Existing pricing - pastikan id adalah integer
              return {
                id: Number(p.id),
                retribution_type: p.retribution_type,
                price_per_day: Number(p.price_per_day),
                is_available: true
              };
            } else {
              // New pricing - hapus id untuk membuat baru
              return {
                // Hapus id untuk pricing baru agar backend generate id baru
                retribution_type: p.retribution_type,
                price_per_day: Number(p.price_per_day),
                is_available: true
              };
            }
          });
          
          // Convert pricing to properly formatted JSON string
          const pricingJsonString = JSON.stringify(formattedPricing);
          
          // Buat FormData seperti biasa
          const formData = new FormData();
          formData.append('name', this.editRoom.name);
          formData.append('type', this.editRoom.type);
          formData.append('facilities', this.editRoom.facilitiesList.join('; '));
          formData.append('total_slot', this.editRoom.total_slot);
          formData.append('area_m2', this.editRoom.area_m2);
          
          // Tambahkan pricing dengan format yang sudah diperbaiki
          formData.append('room_pricing', pricingJsonString);
          
          // Add room photos if any
          this.editRoomPhotos.forEach(photo => {
            formData.append('room_media', photo);
          });
          
          // Add deleted media if any
          if (this.deletedRoomMedia.length > 0) {
            formData.append('deleted_media', JSON.stringify(this.deletedRoomMedia));
          }
          
          // Get token
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // Submit form
          const response = await axios.put(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${this.editGuesthouseId}/rooms/${this.editRoom.id}`,
            formData,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (response.data.status) {
            // Success! Update the room in the editRooms array
            const roomIndex = this.editRooms.findIndex(room => room.id === this.editRoom.id);
            if (roomIndex !== -1) {
              this.editRooms.splice(roomIndex, 1, response.data.data);
            }
            
            // Close the edit room form
            this.closeEditRoomForm();
            alert('Ruang mess berhasil diperbarui!');
          } else {
            throw new Error(response.data.message || 'Failed to update room');
          }
        } catch (error) {
          console.error('Error updating room:', error);
          alert(`Gagal memperbarui ruang: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
          this.isSubmittingEditRoom = false;
        }
      },
      
      // Submit new room
      async submitNewRoomForm() {
        // Validasi form
        if (this.editRoom.facilitiesList.length === 0) {
          alert('Silakan tambahkan minimal satu fasilitas ruang');
          return;
        }
        
        if (this.editRoom.pricing.some(p => !p.retribution_type.trim() || !p.price_per_day)) {
          alert('Silakan lengkapi semua kategori dan harga sewa');
          return;
        }
        
        // Set loading state
        this.isSubmittingEditRoom = true;
        
        try {
          // Format pricing - untuk ruang baru, semua pricing harus id: 0
          const formattedPricing = this.editRoom.pricing.map(p => ({
            id: 0, // ID 0 untuk pricing baru
            retribution_type: p.retribution_type,
            price_per_day: Number(p.price_per_day),
            is_available: true
          }));
          
          // Prepare form data
          const formData = new FormData();
          formData.append('name', this.editRoom.name);
          formData.append('type', this.editRoom.type);
          formData.append('facilities', this.editRoom.facilitiesList.join('; '));
          formData.append('total_slot', this.editRoom.total_slot);
          formData.append('area_m2', this.editRoom.area_m2);
          formData.append('room_pricing', JSON.stringify(formattedPricing));
          
          // Add room photos if any
          this.editRoomPhotos.forEach(photo => {
            formData.append('room_media', photo);
          });
          
          // Get token
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // Submit form
          const response = await axios.post(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${this.editGuesthouseId}/rooms`,
            formData,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (response.data.status) {
            // Add the new room to the editRooms array
            this.editRooms.push(response.data.data);
            
            // Close the edit room form
            this.closeEditRoomForm();
            alert('Ruang mess baru berhasil ditambahkan!');
          } else {
            throw new Error(response.data.message || 'Failed to add new room');
          }
        } catch (error) {
          console.error('Error adding new room:', error);
          alert(`Gagal menambahkan ruang baru: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
          this.isSubmittingEditRoom = false;
        }
      },
      
      // Delete a room
      async deleteRoom(roomId) {
        if (!confirm('Apakah Anda yakin ingin menghapus ruang ini?')) {
          return;
        }
        
        this.isDeletingRoom = true;
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("Anda harus login terlebih dahulu!");
          this.isDeletingRoom = false;
          return;
        }
        
        try {
          const response = await axios.delete(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${this.editGuesthouseId}/rooms/${roomId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.status) {
            // Remove the room from the editRooms array
            this.editRooms = this.editRooms.filter(room => room.id !== roomId);
            
            // If the room being edited is the one deleted, close the edit room form
            if (this.editRoom.id === roomId) {
              this.closeEditRoomForm();
            }
            
            alert('Ruang mess berhasil dihapus!');
          } else {
            throw new Error(response.data.message || 'Failed to delete room');
          }
        } catch (error) {
          console.error('Error deleting room:', error);
          alert(`Gagal menghapus ruang: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
          this.isDeletingRoom = false;
        }
      },
      
      // Delete a guesthouse
      async deleteGuesthouse(guesthouseId) {
        // Confirm deletion
        if (!confirm('Apakah Anda yakin ingin menghapus gedung mess ini? Semua ruang di dalamnya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.')) {
          return;
        }
        
        this.isDeletingGuesthouse = true;
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("Anda harus login terlebih dahulu!");
          this.isDeletingGuesthouse = false;
          return;
        }
        
        try {
          const response = await axios.delete(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses/${guesthouseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.status) {
            // Remove the guesthouse from the list
            this.guesthouses = this.guesthouses.filter(guesthouse => guesthouse.id !== guesthouseId);
            
            alert('Gedung mess berhasil dihapus!');
          } else {
            throw new Error(response.data.message || 'Failed to delete guesthouse');
          }
        } catch (error) {
          console.error('Error deleting guesthouse:', error);
          alert(`Gagal menghapus gedung mess: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
          this.isDeletingGuesthouse = false;
        }
      },
      
      // untuk membuka slideshow foto review
      openReviewPhotoSlideshow(review, startIndex = 0) {
          this.selectedReview = review;
          this.currentReviewSlideIndex = startIndex;
          this.showReviewSlideshow = true;
      },
      
      // navigasi slideshow foto review
      nextReviewSlide() {
          if (this.currentReviewSlideIndex < this.selectedReview?.review_media.length - 1) {
              this.currentReviewSlideIndex++;
          }
      },

      prevReviewSlide() {
          if (this.currentReviewSlideIndex > 0) {
              this.currentReviewSlideIndex--;
          }
      },

      // Method untuk menghandle hover tombol foto
      handlePhotoButtonHover(isHovering) {
          this.isHoveringPhotoButton = isHovering;
      },

      // untuk membuka slideshow foto guesthouse
      openPhotoSlideshow() {
          this.currentSlideIndex = 0;
          this.showSlideshow = true;
      },

      // untuk membuka slideshow foto room
      openRoomPhotoSlideshow(room, startIndex = 0) {
          this.selectedRoom = room;
          this.currentRoomSlideIndex = startIndex;
          this.showRoomSlideshow = true;
      },

      // navigasi slideshow guesthouse
      nextSlide() {
          if (this.currentSlideIndex < this.selectedGuesthouse?.guesthouse_media.length - 1) {
              this.currentSlideIndex++;
          }
      },

      prevSlide() {
          if (this.currentSlideIndex > 0) {
              this.currentSlideIndex--;
          }
      },

      // navigasi slideshow room
      nextRoomSlide() {
          if (this.currentRoomSlideIndex < this.selectedRoom?.media.length - 1) {
              this.currentRoomSlideIndex++;
          }
      },

      prevRoomSlide() {
          if (this.currentRoomSlideIndex > 0) {
              this.currentRoomSlideIndex--;
          }
      },
      
      // mendapatkan URL Maps
      getMapsUrl(latitude, longitude) {
          if (!latitude || !longitude) return '#';
          return `https://www.google.com/maps?q=${latitude},${longitude}`;
      },
  },
  mounted() {
      this.fetchGuesthouses();
  },
};
</script>

<style scoped>
.data-gedung-text, .nama-gedung, .foto-text, .action-button {
  font-family: 'Poppins', sans-serif;
}

.detail-modal-cardbox {
  background-color: #E8F9FF;
  max-height: 90vh;
  overflow-y: auto;
}

.photo-overlay {
  transition: opacity 0.25s ease-in-out;
}

/* Tombol Lihat di Maps */
.maps-button {
  background-color: white !important; /* Memaksa warna latar belakang tetap putih */
  transform: all 1.2s ease;
}

.maps-button:hover {
  background-color: #E8F9FF !important; /* Warna latar tetap putih saat hover */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; /* Shadow tetap sama */
}

.maps-text {
  color: #008BCD !important;
  font-family: 'Poppins', sans-serif;
}

/* tidak ada perubahan ketika hover */
.maps-button:hover, .maps-text:hover * {
  color: inherit !important;
  transform: none !important;
}

.facility-badge {
  background-color: #D1D5DB;
  color: black;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.rating {
  margin-right: 15px;
  margin-top: 3px;
}

/* Tombol Lihat Semua Foto */
.foto-button {
  color: white;
  font-weight: bold;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.foto-icon-container {
  background-color: transparent;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.foto-text {
  font-size: 1rem;
  text-align: center;
}

.foto-button:hover {
  background-color: #1E88E5;
}

/* Animasi untuk modal */
.modal-enter-active, .modal-leave-active {
transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
opacity: 0;
transform: scale(0.9);
}

/* Style untuk tombol navigasi */
.navigation-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.photo-slideshow {
  background-color: rgba(0, 0, 0, 0.2);
}

.navigation-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.navigation-button:focus {
  outline: none;
}

/* Efek hover untuk tombol Tambah Gedung Mess */
.hover-gradient {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hover-gradient:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #3B82F6, #1D4ED8);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.hover-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.hover-gradient:hover:before {
  opacity: 1;
}

/* Efek hover untuk tombol aksi (Detail, Edit, Hapus) */
.hover-action-button {
  transition: all 0.3s ease;
  background: linear-gradient(to right, #3B82F6, #3B82F6);
  background-size: 200% auto;
  background-position: 0% 0%;
}

.hover-action-button:hover {
  background-position: 100% 0%;
  background: linear-gradient(to right, #3B82F6, #2563EB);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
}

.skeleton {
  background: linear-gradient(
      90deg,
      #e0e0e0 25%,
      #f0f0f0 50%,
      #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
      background-position: -200% 0;
  }
  100% {
      background-position: 200% 0;
  }
}

.modal-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

/* For sticky headers/footers in modals */
.modal-sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-sticky-footer {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 10;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
}

/* For small screens */
@media (max-height: 640px) {
  .modal-content {
    max-height: 85vh;
  }
}

.edit-room-form{
  height: 90%;
}

.photo-slideshow {
    background-color: rgba(0, 0, 0, 0.2);
}

.navigation-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.navigation-button:focus {
    outline: none;
}

/* Animasi untuk modal */
.modal-enter-active, .modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>