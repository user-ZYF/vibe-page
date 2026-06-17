<!-- ? 样式编辑面板 -->
<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <!-- 常规配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.GENERAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.GENERAL]">
      <!-- 浮动配置 -->
      <div class="style-config-section">
        <div class="style-config-label">Float</div>
        <a-radio-group v-model:value="generalConfig.float" button-style="solid" size="small" class="style-config-radio-group">
          <a-radio-button value="none"><CloseOutlined /></a-radio-button>
          <a-radio-button value="left"><MenuFoldOutlined /></a-radio-button>
          <a-radio-button value="right"><MenuUnfoldOutlined /></a-radio-button>
        </a-radio-group>
      </div>

      <!-- Display & Position -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Display</div>
          <a-select v-model:value="generalConfig.display" size="small" class="style-config-select">
            <a-select-option v-for="opt in DISPLAY_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.value }}
            </a-select-option>
          </a-select>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Position</div>
          <a-select v-model:value="generalConfig.position" size="small" class="style-config-select">
            <a-select-option v-for="opt in POSITION_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.value }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- Top & Right -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Top</div>
          <div class="style-config-input-group">
            <a-input v-model:value="generalConfig.top" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="generalConfig.topUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Right</div>
          <div class="style-config-input-group">
            <a-input v-model:value="generalConfig.right" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="generalConfig.rightUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Left & Bottom -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Left</div>
          <div class="style-config-input-group">
            <a-input v-model:value="generalConfig.left" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="generalConfig.leftUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Bottom</div>
          <div class="style-config-input-group">
            <a-input v-model:value="generalConfig.bottom" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="generalConfig.bottomUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>
    </a-collapse-panel>

    <!-- 尺寸配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.SIZE" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SIZE]">
      <!-- Width & Height -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Width</div>
          <div class="style-config-input-group">
            <a-input v-model:value="sizeConfig.width" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="sizeConfig.widthUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Height</div>
          <div class="style-config-input-group">
            <a-input v-model:value="sizeConfig.height" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="sizeConfig.heightUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Max width & Min height -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Max width</div>
          <div class="style-config-input-group">
            <a-input v-model:value="sizeConfig.maxWidth" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="sizeConfig.maxWidthUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Min height</div>
          <div class="style-config-input-group">
            <a-input v-model:value="sizeConfig.minHeight" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="sizeConfig.minHeightUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Margin -->
      <div class="style-config-label style-config-label--margin">Margin</div>
      <div class="style-config-box">
        <!-- Margin Top & Right -->
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Top</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="sizeConfig.marginTop" size="small" class="style-config-input-number" />
              <a-select v-model:value="sizeConfig.marginTopUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Right</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="sizeConfig.marginRight" size="small" class="style-config-input-number" />
              <a-select v-model:value="sizeConfig.marginRightUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
        <!-- Margin Bottom & Left -->
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Bottom</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="sizeConfig.marginBottom" size="small" class="style-config-input-number" />
              <a-select v-model:value="sizeConfig.marginBottomUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Left</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="sizeConfig.marginLeft" size="small" class="style-config-input-number" />
              <a-select v-model:value="sizeConfig.marginLeftUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
      </div>
    </a-collapse-panel>

    <!-- 字体相关配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.FONT" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FONT]">
      <!-- Font family & Font size -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Font family</div>
          <a-select v-model:value="fontConfig.fontFamily" size="small" class="style-config-select">
            <a-select-option v-for="opt in FONT_FAMILY_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Font size</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="fontConfig.fontSize" size="small" class="style-config-input-number" />
            <a-select v-model:value="fontConfig.fontSizeUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Font weight & Letter spacing -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Font weight</div>
          <a-select v-model:value="fontConfig.fontWeight" size="small" class="style-config-select">
            <a-select-option v-for="opt in FONT_WEIGHT_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Letter spacing</div>
          <div class="style-config-input-group">
            <a-input v-model:value="fontConfig.letterSpacing" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="fontConfig.letterSpacingUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.value }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Color -->
      <div class="style-config-section">
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row">
          <a-input v-model:value="fontConfig.color" size="small" class="style-config-input" />
          <input
            type="color"
            v-model="fontConfig.color"
            class="style-config-color-picker"
          />
        </div>
      </div>

      <!-- Line height -->
      <div class="style-config-section">
        <div class="style-config-label">Line height</div>
        <div class="style-config-input-group" style="width: 50%; padding-right: 4px;">
          <a-input v-model:value="fontConfig.lineHeight" size="small" class="style-config-input" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="fontConfig.lineHeightUnit" size="small" class="style-config-unit">
            <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.value }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- Text align -->
      <div class="style-config-section">
        <div class="style-config-label">Text align</div>
        <a-radio-group v-model:value="fontConfig.textAlign" button-style="solid" size="small" class="style-config-radio-group">
          <a-radio-button value="left"><AlignLeftOutlined /></a-radio-button>
          <a-radio-button value="center"><AlignCenterOutlined /></a-radio-button>
          <a-radio-button value="right"><AlignRightOutlined /></a-radio-button>
          <a-radio-button value="justify"><MenuOutlined /></a-radio-button>
        </a-radio-group>
      </div>

      <!-- Text decoration -->
      <div class="style-config-section">
        <div class="style-config-label">
          Text decoration
          <CloseCircleOutlined
            v-if="fontConfig.textDecoration !== 'none'"
            class="style-config-clear"
            @click="fontConfig.textDecoration = 'none'"
          />
        </div>
        <a-radio-group v-model:value="fontConfig.textDecoration" button-style="solid" size="small" class="style-config-radio-group">
          <a-radio-button value="none"><CloseOutlined /></a-radio-button>
          <a-radio-button value="underline"><UnderlineOutlined /></a-radio-button>
          <a-radio-button value="line-through"><StrikethroughOutlined /></a-radio-button>
        </a-radio-group>
      </div>

      <!-- Text shadow -->
      <div class="style-config-section">
        <div class="style-config-label style-config-label--flex">
          <span>Text shadow</span>
          <PlusOutlined class="style-config-add" @click="handleAddTextShadow" />
        </div>
        <div
          v-for="(shadow, index) in fontConfig.textShadows"
          :key="index"
          class="style-config-box style-config-box--shadow"
        >
          <div class="style-config-shadow-preview">
            <DragOutlined class="style-config-drag-icon" />
            <span>{{ shadow.x }} {{ shadow.y }} {{ shadow.blur }}</span>
            <BoldOutlined class="style-config-shadow-icon" />
            <CloseOutlined class="style-config-shadow-close" @click="fontConfig.textShadows.splice(index, 1)" />
          </div>
          <!-- X & Y -->
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">X</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.x" size="small" class="style-config-input-number" />
                <a-select v-model:value="shadow.xUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.value }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Y</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.y" size="small" class="style-config-input-number" />
                <a-select v-model:value="shadow.yUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.value }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>
          <!-- Blur -->
          <div class="style-config-section">
            <div class="style-config-label">Blur</div>
            <div class="style-config-input-group" style="width: 50%; padding-right: 4px;">
              <a-input-number v-model:value="shadow.blur" size="small" class="style-config-input-number" />
              <a-select v-model:value="shadow.blurUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <!-- Shadow Color -->
          <div class="style-config-section">
            <div class="style-config-label">Color</div>
            <div class="style-config-color-row">
              <a-input v-model:value="shadow.color" size="small" class="style-config-input" />
              <input type="color" v-model="shadow.color" class="style-config-color-picker" />
            </div>
          </div>
        </div>
      </div>
    </a-collapse-panel>

    <!-- 视觉配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.VISUAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.VISUAL]">
      <!-- Background -->
      <div class="style-config-section">
        <div class="style-config-label style-config-label--flex">
          <span>
            Background
            <CloseCircleOutlined
              v-if="visualConfig.backgrounds.length > 0"
              class="style-config-clear"
              @click="visualConfig.backgrounds = []"
            />
          </span>
          <PlusOutlined class="style-config-add" @click="handleAddBackground" />
        </div>

        <!-- 每一层 background -->
        <div
          v-for="(bg, index) in visualConfig.backgrounds"
          :key="index"
          class="style-config-box style-config-box--shadow"
        >
          <!-- 层标题行 -->
          <div class="style-config-shadow-preview">
            <DragOutlined class="style-config-drag-icon" />
            <span>{{ bg.type === 'image' ? 'Image' : bg.type === 'color' ? 'Color' : 'Gradient' }}</span>
            <!-- 颜色预览（color/gradient 类型） -->
            <input
              v-if="bg.type === 'color'"
              type="color"
              v-model="bg.color"
              class="style-config-color-picker"
              style="width:20px;height:20px;margin-left:auto;"
            />
            <CloseOutlined class="style-config-shadow-close" @click="visualConfig.backgrounds.splice(index, 1)" />
          </div>

          <!-- 类型切换 -->
          <a-radio-group v-model:value="bg.type" button-style="solid" size="small" class="style-config-radio-group" style="margin-bottom:8px;">
            <a-radio-button value="image"><PictureOutlined /></a-radio-button>
            <a-radio-button value="color"><BgColorsOutlined /></a-radio-button>
            <a-radio-button value="gradient"><GatewayOutlined /></a-radio-button>
          </a-radio-group>

          <!-- Image 类型 -->
          <template v-if="bg.type === 'image'">
            <div class="style-config-label">Image</div>
            <a-input v-model:value="bg.imageUrl" size="small" placeholder="url(...)" style="margin-bottom:8px;" />
            <div class="style-config-row">
              <div class="style-config-col">
                <div class="style-config-label">Repeat</div>
                <a-select v-model:value="bg.repeat" size="small" class="style-config-select">
                  <a-select-option v-for="opt in BG_REPEAT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
                </a-select>
              </div>
              <div class="style-config-col">
                <div class="style-config-label">Position</div>
                <a-select v-model:value="bg.position" size="small" class="style-config-select">
                  <a-select-option v-for="opt in BG_POSITION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
                </a-select>
              </div>
            </div>
            <div class="style-config-row">
              <div class="style-config-col">
                <div class="style-config-label">Attachment</div>
                <a-select v-model:value="bg.attachment" size="small" class="style-config-select">
                  <a-select-option v-for="opt in BG_ATTACHMENT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
                </a-select>
              </div>
              <div class="style-config-col">
                <div class="style-config-label">Size</div>
                <a-select v-model:value="bg.size" size="small" class="style-config-select">
                  <a-select-option v-for="opt in BG_SIZE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
                </a-select>
              </div>
            </div>
          </template>

          <!-- Color 类型 -->
          <template v-else-if="bg.type === 'color'">
            <div class="style-config-label">Color</div>
            <div class="style-config-color-row">
              <a-input v-model:value="bg.color" size="small" class="style-config-input" />
              <input type="color" v-model="bg.color" class="style-config-color-picker" />
            </div>
          </template>

          <!-- Gradient 类型 -->
          <template v-else>
            <div class="style-config-label">Gradient</div>
            <a-input v-model:value="bg.gradient" size="small" placeholder="linear-gradient(...)" />
          </template>
        </div>
      </div>

      <!-- Border -->
      <div class="style-config-section">
        <div class="style-config-label">Border</div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Width</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="visualConfig.borderWidth" size="small" class="style-config-input-number" :min="0" />
              <a-select v-model:value="visualConfig.borderWidthUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Style</div>
            <a-select v-model:value="visualConfig.borderStyle" size="small" class="style-config-select">
              <a-select-option v-for="opt in BORDER_STYLE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row">
          <a-input v-model:value="visualConfig.borderColor" size="small" class="style-config-input" />
          <input type="color" v-model="visualConfig.borderColor" class="style-config-color-picker" />
        </div>
      </div>

      <!-- Border radius -->
      <div class="style-config-section">
        <div class="style-config-label">Border radius</div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">TL</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="visualConfig.borderRadiusTL" size="small" class="style-config-input-number" :min="0" />
              <a-select v-model:value="visualConfig.borderRadiusUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">TR</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="visualConfig.borderRadiusTR" size="small" class="style-config-input-number" :min="0" />
              <a-select v-model:value="visualConfig.borderRadiusUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">BL</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="visualConfig.borderRadiusBL" size="small" class="style-config-input-number" :min="0" />
              <a-select v-model:value="visualConfig.borderRadiusUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">BR</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="visualConfig.borderRadiusBR" size="small" class="style-config-input-number" :min="0" />
              <a-select v-model:value="visualConfig.borderRadiusUnit" size="small" class="style-config-unit">
                <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.value }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Opacity -->
      <div class="style-config-section">
        <div class="style-config-label">Opacity</div>
        <div class="style-config-opacity-row">
          <a-slider v-model:value="visualConfig.opacity" :min="0" :max="1" :step="0.01" class="style-config-slider" />
          <a-input-number
            v-model:value="visualConfig.opacity"
            size="small"
            :min="0"
            :max="1"
            :step="0.01"
            class="style-config-opacity-input"
          />
        </div>
      </div>

      <!-- Box shadow -->
      <div class="style-config-section">
        <div class="style-config-label style-config-label--flex">
          <span>Box shadow</span>
          <PlusOutlined class="style-config-add" @click="handleAddBoxShadow" />
        </div>
        <div
          v-for="(shadow, index) in visualConfig.boxShadows"
          :key="index"
          class="style-config-box style-config-box--shadow"
        >
          <div class="style-config-shadow-preview">
            <DragOutlined class="style-config-drag-icon" />
            <span>{{ shadow.x }}px {{ shadow.y }}px {{ shadow.blur }}px {{ shadow.spread }}px</span>
            <CloseOutlined class="style-config-shadow-close" @click="visualConfig.boxShadows.splice(index, 1)" />
          </div>
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">X</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.x" size="small" class="style-config-input-number" />
                <a-select v-model:value="shadow.xUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
                </a-select>
              </div>
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Y</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.y" size="small" class="style-config-input-number" />
                <a-select v-model:value="shadow.yUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">Blur</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.blur" size="small" class="style-config-input-number" :min="0" />
                <a-select v-model:value="shadow.blurUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
                </a-select>
              </div>
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Spread</div>
              <div class="style-config-input-group">
                <a-input-number v-model:value="shadow.spread" size="small" class="style-config-input-number" />
                <a-select v-model:value="shadow.spreadUnit" size="small" class="style-config-unit">
                  <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
          <div class="style-config-label">Color</div>
          <div class="style-config-color-row" style="margin-bottom: 8px;">
            <a-input v-model:value="shadow.color" size="small" class="style-config-input" />
            <input type="color" v-model="shadow.color" class="style-config-color-picker" />
          </div>
          <a-checkbox v-model:checked="shadow.inset" size="small">
            <span class="style-config-checkbox-label">Inset</span>
          </a-checkbox>
        </div>
      </div>
    </a-collapse-panel>

    <!-- 布局配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.FLEX" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FLEX]">
      <!-- Flex Container & Flex Parent -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Flex Container</div>
          <a-select v-model:value="flexConfig.flexContainer" size="small" class="style-config-select">
            <a-select-option v-for="opt in FLEX_CONTAINER_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Flex Parent</div>
          <a-input-number v-model:value="flexConfig.flexParent" size="small" class="style-config-input-number" />
        </div>
      </div>

      <!-- Direction -->
      <div class="style-config-section">
        <div class="style-config-label">Direction</div>
        <a-radio-group v-model:value="flexConfig.flexDirection" button-style="solid" size="small" class="style-config-radio-group">
          <a-tooltip title="row">
            <a-radio-button value="row"><LayoutOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="row-reverse">
            <a-radio-button value="row-reverse"><LayoutOutlined style="transform:scaleX(-1)" /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="column">
            <a-radio-button value="column"><ColumnHeightOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="column-reverse">
            <a-radio-button value="column-reverse"><ColumnHeightOutlined style="transform:scaleY(-1)" /></a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </div>

      <!-- Justify -->
      <div class="style-config-section">
        <div class="style-config-label">Justify</div>
        <a-radio-group v-model:value="flexConfig.justifyContent" button-style="solid" size="small" class="style-config-radio-group">
          <a-tooltip title="flex-start">
            <a-radio-button value="flex-start"><VerticalLeftOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="center">
            <a-radio-button value="center"><ColumnWidthOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="flex-end">
            <a-radio-button value="flex-end"><VerticalRightOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="space-between">
            <a-radio-button value="space-between"><SplitCellsOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="space-around">
            <a-radio-button value="space-around"><ExpandOutlined /></a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </div>

      <!-- Align -->
      <div class="style-config-section">
        <div class="style-config-label">Align</div>
        <a-radio-group v-model:value="flexConfig.alignItems" button-style="solid" size="small" class="style-config-radio-group">
          <a-tooltip title="flex-start">
            <a-radio-button value="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="center">
            <a-radio-button value="center"><VerticalAlignMiddleOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="flex-end">
            <a-radio-button value="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="stretch">
            <a-radio-button value="stretch"><ExpandAltOutlined /></a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </div>

      <!-- Flex Children & Order -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Flex Children</div>
          <a-input-number v-model:value="flexConfig.flexChildren" size="small" class="style-config-input-number" />
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Order</div>
          <a-input-number v-model:value="flexConfig.order" size="small" class="style-config-input-number" />
        </div>
      </div>

      <!-- Flex (Grow / Shrink / Basis) -->
      <div class="style-config-label style-config-label--margin">Flex</div>
      <div class="style-config-box">
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Grow</div>
            <a-input-number v-model:value="flexConfig.flexGrow" size="small" class="style-config-input-number" :min="0" />
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Shrink</div>
            <a-input-number v-model:value="flexConfig.flexShrink" size="small" class="style-config-input-number" :min="0" />
          </div>
        </div>
        <div class="style-config-section">
          <div class="style-config-label">Basis</div>
          <div class="style-config-input-group" style="width: 60%;">
            <a-input v-model:value="flexConfig.flexBasis" size="small" class="style-config-input" />
            <span class="style-config-separator">-</span>
            <a-select v-model:value="flexConfig.flexBasisUnit" size="small" class="style-config-unit">
              <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Align self -->
      <div class="style-config-section" style="margin-top: 12px;">
        <div class="style-config-label">Align</div>
        <a-radio-group v-model:value="flexConfig.alignSelf" button-style="solid" size="small" class="style-config-radio-group">
          <a-radio-button value="auto">Auto</a-radio-button>
          <a-tooltip title="flex-start">
            <a-radio-button value="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="center">
            <a-radio-button value="center"><VerticalAlignMiddleOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="flex-end">
            <a-radio-button value="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
          </a-tooltip>
          <a-tooltip title="stretch">
            <a-radio-button value="stretch"><ExpandAltOutlined /></a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  DragOutlined,
  BoldOutlined,
  PictureOutlined,
  BgColorsOutlined,
  GatewayOutlined,
  LayoutOutlined,
  ColumnHeightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
  ExpandOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ExpandAltOutlined,
} from '@ant-design/icons-vue';
import {
  StyleConfigTypeEnum,
  STYLE_CONFIG_TYPE_NAME,
  DISPLAY_OPTIONS,
  POSITION_OPTIONS,
  SIZE_UNIT_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  BORDER_STYLE_OPTIONS,
  BG_ATTACHMENT_OPTIONS,
  BG_REPEAT_OPTIONS,
  BG_SIZE_OPTIONS,
  BG_POSITION_OPTIONS,
  FLEX_CONTAINER_OPTIONS,
} from '@/constants/home';

defineOptions({
  name: 'StyleConfig',
});

/** 展开的面板配置 */
const activeKey = ref([StyleConfigTypeEnum.GENERAL, StyleConfigTypeEnum.SIZE, StyleConfigTypeEnum.FONT, StyleConfigTypeEnum.VISUAL, StyleConfigTypeEnum.FLEX]);

/** 常规配置 */
const generalConfig = ref({
  float: 'none',
  display: 'block',
  position: 'static',
  top: 'auto',
  topUnit: 'px',
  right: 'auto',
  rightUnit: 'px',
  left: 'auto',
  leftUnit: 'px',
  bottom: 'auto',
  bottomUnit: 'px',
});

/** 字体配置 */
const fontConfig = ref({
  fontFamily: 'Arial',
  fontSize: 40,
  fontSizeUnit: 'px',
  fontWeight: 'normal',
  letterSpacing: 'normal',
  letterSpacingUnit: 'px',
  color: '#000000',
  lineHeight: 'normal',
  lineHeightUnit: 'px',
  textAlign: 'left',
  textDecoration: 'none',
  textShadows: [] as Array<{
    x: number; xUnit: string;
    y: number; yUnit: string;
    blur: number; blurUnit: string;
    color: string;
  }>,
});

/** 布局配置 */
const flexConfig = ref({
  flexContainer: 'disable',
  flexParent: null as number | null,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexChildren: null as number | null,
  order: null as number | null,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  flexBasisUnit: 'px',
  alignSelf: 'auto',
});

/** 视觉配置 */
const visualConfig = ref({
  backgrounds: [] as Array<{
    type: 'image' | 'color' | 'gradient';
    imageUrl: string;
    repeat: string;
    position: string;
    attachment: string;
    size: string;
    color: string;
    gradient: string;
  }>,
  borderWidth: 0,
  borderWidthUnit: 'px',
  borderStyle: 'none',
  borderColor: '#000000',
  borderRadiusTL: 0,
  borderRadiusTR: 0,
  borderRadiusBL: 0,
  borderRadiusBR: 0,
  borderRadiusUnit: 'px',
  opacity: 1,
  boxShadows: [] as Array<{
    x: number; xUnit: string;
    y: number; yUnit: string;
    blur: number; blurUnit: string;
    spread: number; spreadUnit: string;
    color: string;
    inset: boolean;
  }>,
});

/**
 * 添加 text-shadow 项
 */
function handleAddTextShadow() {
  fontConfig.value.textShadows.push({
    x: 0, xUnit: 'px',
    y: 0, yUnit: 'px',
    blur: 0, blurUnit: 'px',
    color: '#000000',
  });
}

/**
 * 添加 background 层
 */
function handleAddBackground() {
  visualConfig.value.backgrounds.push({
    type: 'image',
    imageUrl: '',
    repeat: 'repeat',
    position: 'left top',
    attachment: 'scroll',
    size: 'auto',
    color: '#ffffff',
    gradient: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)',
  });
}

/**
 * 添加 box-shadow 项
 */
function handleAddBoxShadow() {
  visualConfig.value.boxShadows.push({
    x: 0, xUnit: 'px',
    y: 0, yUnit: 'px',
    blur: 0, blurUnit: 'px',
    spread: 0, spreadUnit: 'px',
    color: '#000000',
    inset: false,
  });
}

/** 尺寸配置 */
const sizeConfig = ref({
  width: 'auto',
  widthUnit: 'px',
  height: 'auto',
  heightUnit: 'px',
  maxWidth: 'auto',
  maxWidthUnit: 'px',
  minHeight: 'auto',
  minHeightUnit: 'px',
  marginTop: 150,
  marginTopUnit: 'px',
  marginRight: 0,
  marginRightUnit: 'px',
  marginBottom: 30,
  marginBottomUnit: 'px',
  marginLeft: 0,
  marginLeftUnit: 'px',
});
</script>

<style scoped lang="less">
:deep(.ant-collapse-header-text) {
  color: #fff;
  font-weight: 500;
}

:deep(.ant-collapse-expand-icon) {
  color: #fff;
}

.style-config-section {
  margin-bottom: 12px;
}

.style-config-label {
  font-size: 12px;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.65);

  &--margin {
    margin-top: 4px;
    margin-bottom: 8px;
  }
}

.style-config-radio-group {
  width: 100%;

  :deep(.ant-radio-button-wrapper) {
    flex: 1;
    text-align: center;
  }
}

.style-config-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.style-config-col {
  flex: 1;
  min-width: 0;
}

.style-config-select {
  width: 100%;
}

.style-config-input-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.style-config-input {
  flex: 1;
  min-width: 0;
}

.style-config-input-number {
  flex: 1;
  min-width: 0;
  width: 100%;

  :deep(.ant-input-number-input) {
    padding: 0 4px;
  }
}

.style-config-separator {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
  padding: 0 2px;
}

.style-config-unit {
  width: 56px;
  flex-shrink: 0;
}

.style-config-box {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 8px;
}

.style-config-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.style-config-color-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
  overflow: hidden;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 4px;
  }
}

.style-config-label--flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.style-config-clear {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.65;

  &:hover {
    opacity: 1;
  }
}

.style-config-add {
  cursor: pointer;
  opacity: 0.65;

  &:hover {
    opacity: 1;
  }
}

.style-config-shadow-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.style-config-drag-icon {
  cursor: move;
  opacity: 0.5;
}

.style-config-shadow-icon {
  margin-left: auto;
  opacity: 0.65;
}

.style-config-shadow-close {
  cursor: pointer;
  opacity: 0.65;

  &:hover {
    opacity: 1;
  }
}

.style-config-opacity-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.style-config-slider {
  flex: 1;
}

.style-config-opacity-input {
  width: 64px;
  flex-shrink: 0;
}

.style-config-box--shadow {
  margin-bottom: 8px;
}

.style-config-checkbox-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}
</style>

