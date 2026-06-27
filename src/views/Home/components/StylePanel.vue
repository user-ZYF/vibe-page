<!-- ? 样式编辑面板 -->
<template>
  <div class="style-panel">
    <div class="style-panel-empty" v-if="!selectedElementId">请选择一个元素</div>
    <template v-else>
      <!-- class 管理栏 -->
      <div class="style-panel-classes">
        <template v-if="!isRootElement">
          <div class="style-panel-classes-title">Classes</div>
          <div class="style-panel-classes-bar">
            <div
              v-for="cls in selectedElement!.classNames"
              :key="cls"
              class="style-panel-classes-tag"
              :class="{ 'is-active': activeClassName === cls }"
              @click.stop="handleClassTagClick(cls)"
            >
              <a-checkbox
                :checked="isClassEnabled(cls)"
                @change="(e: CheckboxChangeEvent) => handleClassToggle(cls, e.target.checked)"
                @click.stop
              ></a-checkbox>
              <span class="style-panel-classes-tag-name">{{ cls }}</span>
              <CloseOutlined
                class="style-panel-classes-tag-remove"
                @click.stop="handleClassRemove(cls)"
              />
            </div>
            <a-button
              class="style-panel-classes-add"
              size="small"
              @click="handleAddClass"
            >
              <PlusOutlined />
            </a-button>
          </div>
        </template>
        <div class="style-panel-classes-selected">
          Selected: {{ selectedElement!.alias || selectedElement!.type }}{{ activeClassName ? `.${activeClassName}` : `#${selectedElement!.id}` }}
        </div>
      </div>

      <!-- 样式配置面板 -->
      <a-collapse v-model:activeKey="activeKey" ghost accordion>
        <!-- 常规配置 -->
        <a-collapse-panel v-if="!isRootElement" :key="StyleConfigTypeEnum.GENERAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.GENERAL]">
          <GeneralConfig v-model="activeStyleConfig!.general" />
        </a-collapse-panel>

        <!-- 尺寸配置 -->
        <a-collapse-panel v-if="!isRootElement" :key="StyleConfigTypeEnum.SIZE" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SIZE]">
          <SizeConfig v-model="activeStyleConfig!.size" />
        </a-collapse-panel>

        <!-- 字体相关配置 -->
        <a-collapse-panel v-if="!isRootElement" :key="StyleConfigTypeEnum.FONT" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FONT]">
          <FontConfig v-model="activeStyleConfig!.font" />
        </a-collapse-panel>

        <!-- 视觉配置 -->
        <a-collapse-panel :key="StyleConfigTypeEnum.VISUAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.VISUAL]">
          <VisualConfig v-model="activeStyleConfig!.visual" :only-background="isRootElement" />
        </a-collapse-panel>

        <!-- 布局配置 -->
        <a-collapse-panel v-if="!isRootElement" :key="StyleConfigTypeEnum.FLEX" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FLEX]">
          <FlexConfig v-model="activeStyleConfig!.flex" />
        </a-collapse-panel>
      </a-collapse>
    </template>

    <!-- 新增 class 弹窗 -->
    <a-modal
      v-model:open="addClassModalVisible"
      title="添加 Class"
      :ok-text="'确认'"
      :cancel-text="'取消'"
      @ok="handleAddClassConfirm"
    >
      <a-input
        v-model:value="newClassName"
        placeholder="请输入 class 名称"
        @pressEnter="handleAddClassConfirm"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { StyleConfigTypeEnum, STYLE_CONFIG_TYPE_NAME } from '@/constants/style';
import { CanvasElementTypeEnum } from '@/constants/home';
import GeneralConfig from './style-panel/GeneralConfig.vue';
import SizeConfig from './style-panel/SizeConfig.vue';
import FontConfig from './style-panel/FontConfig.vue';
import VisualConfig from './style-panel/VisualConfig.vue';
import FlexConfig from './style-panel/FlexConfig.vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface';

defineOptions({
  name: 'StylePanel',
});

/** 展开的面板配置 */
const activeKey = ref<StyleConfigTypeEnum>(StyleConfigTypeEnum.GENERAL);

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 选中的元素对象 */
const selectedElement = computed(() => {
  if (!selectedElementId.value) {
    return null;
  }
  return canvasStore.getElementById(selectedElementId.value);
});

/** 当前选中的 class 名称（null 表示编辑 id 选择器样式） */
const activeClassName = ref<string | null>(null);

/** 当前选中的是否为根元素 */
const isRootElement = computed(() => selectedElement.value?.type === CanvasElementTypeEnum.ROOT);

/** 当前实际编辑的 StyleConfig */
const activeStyleConfig = computed(() => {
  if (!selectedElement.value) return null;
  if (activeClassName.value) {
    return canvasStore.getOrCreateClassStyle(activeClassName.value);
  }
  return selectedElement.value.styleConfig;
});

/** 判断某个 class 是否处于启用态（元素 classes 数组中包含） */
function isClassEnabled(cls: string): boolean {
  return selectedElement.value?.classes.includes(cls) ?? false;
}

/** 点击 class tag */
function handleClassTagClick(cls: string) {
  if (activeClassName.value === cls) {
    activeClassName.value = null;
  } else {
    activeClassName.value = cls;
  }
}

/** 切换 class 的启用/禁用（控制元素是否含有该 class） */
function handleClassToggle(cls: string, enabled: boolean) {
  const el = selectedElement.value;
  if (!el) return;
  if (enabled) {
    if (!el.classes.includes(cls)) {
      el.classes.push(cls);
    }
  } else {
    const idx = el.classes.indexOf(cls);
    if (idx !== -1) {
      el.classes.splice(idx, 1);
    }
  }
}

/** 删除 class（从 classNames 和 classes 中均移除） */
function handleClassRemove(cls: string) {
  const el = selectedElement.value;
  if (!el) return;
  const namesIdx = el.classNames.indexOf(cls);
  if (namesIdx !== -1) {
    el.classNames.splice(namesIdx, 1);
  }
  const enabledIdx = el.classes.indexOf(cls);
  if (enabledIdx !== -1) {
    el.classes.splice(enabledIdx, 1);
  }
  if (activeClassName.value === cls) {
    activeClassName.value = null;
  }
}

/** 新增 class 弹窗可见态 */
const addClassModalVisible = ref(false);
/** 新增 class 名称输入值 */
const newClassName = ref('');

/** 打开新增 class 弹窗 */
function handleAddClass() {
  newClassName.value = '';
  addClassModalVisible.value = true;
}

/** 确认新增 class */
function handleAddClassConfirm() {
  const cls = newClassName.value.trim();
  const el = selectedElement.value;
  if (!cls || !el) return;
  if (!el.classNames.includes(cls)) {
    el.classNames.push(cls);
    el.classes.push(cls);
    canvasStore.getOrCreateClassStyle(cls);
  }
  addClassModalVisible.value = false;
  newClassName.value = '';
}

/** 当切换选中元素时，重置 activeClassName */
watch(selectedElementId, () => {
  activeClassName.value = null;
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

.style-panel {
  &-empty {
    color: #fff;
    text-align: center;
    padding: 20px;
  }

  &-classes {
    padding: 12px 12px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &-title {
      color: #fff;
      font-size: 13px;
      margin-bottom: 8px;
    }

    &-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    &-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.2s, border-color 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      &.is-active {
        background: rgba(130, 80, 180, 0.5);
        border-color: rgba(160, 100, 220, 0.8);
      }

      &-name {
        color: #fff;
        font-size: 12px;
      }

      &-remove {
        color: rgba(255, 255, 255, 0.6);
        font-size: 10px;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: #fff;
        }
      }
    }

    &-add {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: transparent !important;
      color: #fff !important;
      padding: 2px 6px;

      &:hover {
        background: rgba(255, 255, 255, 0.25) !important;
      }
    }

    &-selected {
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
    }
  }
}
</style>

