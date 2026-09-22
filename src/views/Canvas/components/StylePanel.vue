<!-- ? 样式编辑面板 -->
<template>
  <div class="style-panel">
    <div class="style-panel-empty" v-if="!selectedElementId">请选择一个元素</div>
    <template v-else>
      <!-- class 管理栏 -->
      <div class="style-panel-classes" v-if="!isRootElement && !isTextElement">
        <div class="style-panel-classes-title">Classes</div>
        <div class="style-panel-classes-bar">
          <me-tag
            v-for="cls in selectedElement!.classes"
            :key="cls.name"
            class="style-panel-classes-tag"
            :class="{ 'is-active': activeClassName === cls.name, 'is-disabled': !cls.enabled }"
            closable
            @click="handleClassTagClick(cls.name)"
            @close="handleClassRemove(cls.name)"
          >
            <EyeInvisibleOutlined
              v-if="!cls.enabled"
              class="style-panel-classes-tag-toggle"
              @click.stop="handleClassToggle(cls.name, true)"
            />
            <EyeOutlined
              v-else
              class="style-panel-classes-tag-toggle"
              @click.stop="handleClassToggle(cls.name, false)"
            />
            <span class="style-panel-classes-tag-name">{{ cls.name }}</span>
          </me-tag>
        </div>
        <div class="style-panel-classes-input-wrapper">
          <me-input
            v-model="newClassName"
            placeholder="添加class..."
            @keydown.enter="handleAddClass"
          />
          <div v-if="newClassName && !isClassNameValid" class="style-panel-classes-error">
            class 名称须以字母、下划线或连字符开头，仅包含字母、数字、下划线和连字符
          </div>
        </div>
      </div>

      <!-- 选中态指示 -->
      <div class="style-panel-target" v-if="!isRootElement && !isTextElement">
        <template v-if="activeClassName">
          <me-tag class="style-panel-target-badge is-class">Class</me-tag>
          <span class="style-panel-target-text">.{{ activeClassName }}</span>
          <span class="style-panel-target-switch" @click="handleClassTagClick(activeClassName)">切换到元素样式</span>
        </template>
        <template v-else>
          <me-tag class="style-panel-target-badge is-element">元素</me-tag>
          <span class="style-panel-target-text">{{ getElementDisplayName(selectedElement!) }}</span>
        </template>
      </div>

      <!-- 样式配置面板 -->
      <a-collapse v-model:activeKey="activeKey" ghost accordion>
        <template #expandIcon="{ isActive }">
          <CaretRightOutlined :rotate="isActive ? 90 : 0" />
        </template>
        <!-- 元素设置配置 -->
        <a-collapse-panel v-if="!isRootElement && !activeClassName" :key="StyleConfigTypeEnum.SETTING" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SETTING]">
          <SettingConfig v-model="(selectedElement as CanvasInnerElement)" />
        </a-collapse-panel>

        <!-- 额外属性配置 -->
        <a-collapse-panel v-if="!isRootElement && !isTextElement && !activeClassName && hasExtraConfig" :key="StyleConfigTypeEnum.EXTRA" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.EXTRA]">
          <ExtraConfig v-model:element="(selectedElement as CanvasInnerElement)" v-model:style-config="activeStyleConfig!" />
        </a-collapse-panel>

        <!-- 常规配置 -->
        <a-collapse-panel v-if="!isRootElement && !isTextElement" :key="StyleConfigTypeEnum.GENERAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.GENERAL]">
          <GeneralConfig v-model="activeStyleConfig!.general" :element-type="selectedElement!.type" />
        </a-collapse-panel>

        <!-- 尺寸配置 -->
        <a-collapse-panel v-if="!isRootElement && !isTextElement" :key="StyleConfigTypeEnum.SIZE" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SIZE]">
          <SizeConfig v-model="activeStyleConfig!.size" />
        </a-collapse-panel>

        <!-- 字体配置 -->
        <a-collapse-panel v-if="!isRootElement && !isTextElement" :key="StyleConfigTypeEnum.FONT" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FONT]">
          <FontConfig v-model="activeStyleConfig!.font" />
        </a-collapse-panel>

        <!-- 视觉配置 -->
        <a-collapse-panel v-if="!isTextElement" :key="StyleConfigTypeEnum.VISUAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.VISUAL]">
          <VisualConfig v-model="activeStyleConfig!.visual" :only-background="isRootElement" />
        </a-collapse-panel>

        <!-- 弹性盒配置 -->
        <a-collapse-panel v-if="!isRootElement && !isTextElement" :key="StyleConfigTypeEnum.FLEX" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FLEX]">
          <FlexConfig v-model="activeStyleConfig!.flex" />
        </a-collapse-panel>
      </a-collapse>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { isEqual } from 'lodash';
import { StyleConfigTypeEnum, STYLE_CONFIG_TYPE_NAME, CSS_NAME_REGEX } from '@/constants/style';
import { CanvasElementTypeEnum, getElementDisplayName } from '@/constants/home';
import type { CanvasInnerElement, StyleConfig } from '@/views/Canvas/types';
import GeneralConfig from './style-panel/GeneralConfig.vue';
import SizeConfig from './style-panel/SizeConfig.vue';
import FontConfig from './style-panel/FontConfig.vue';
import VisualConfig from './style-panel/VisualConfig.vue';
import FlexConfig from './style-panel/FlexConfig.vue';
import SettingConfig from './style-panel/SettingConfig.vue';
import ExtraConfig from './style-panel/ExtraConfig.vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CaretRightOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';
import { MeInput, MeTag } from '@zyf_dsb/me-ui';
import { EXTRA_CONFIG_TYPES } from '../constants.ts';

defineOptions({
  name: 'StylePanel',
});

/** 展开的面板配置 */
const activeKey = ref<StyleConfigTypeEnum>(StyleConfigTypeEnum.SETTING);

const canvasStore = useCanvasStore();
const { selectedElementId, activeClassName } = storeToRefs(canvasStore);

/** 选中的元素对象 */
const selectedElement = computed(() => {
  if (!selectedElementId.value) {
    return null;
  }
  return canvasStore.getElementById(selectedElementId.value);
});

/** 当前选中的是否为根元素 */
const isRootElement = computed(() => selectedElement.value?.type === CanvasElementTypeEnum.ROOT);

/** 当前选中的是否为纯文本元素 */
const isTextElement = computed(() => selectedElement.value?.type === CanvasElementTypeEnum.TEXT);

/** 是否存在额外配置 */
const hasExtraConfig = computed(() => EXTRA_CONFIG_TYPES.includes(selectedElement.value?.type as CanvasElementTypeEnum));

/** 当前编辑目标的选择器 */
const activeSelector = computed(() => {
  if (!selectedElement.value) return null;
  return activeClassName.value ? `.${activeClassName.value}` : `#${selectedElement.value.id}`;
});

/** 当前实际编辑的 StyleConfig（规则的可变编辑副本，修改后经 deep watch 写回规则） */
const activeStyleConfig = ref<StyleConfig | null>(null);

/** 切换编辑目标时，从规则派生新的编辑副本 */
watch(activeSelector, (selector) => {
  activeStyleConfig.value = selector ? canvasStore.getOrCreateStyleConfig(selector) : null;
}, { immediate: true });

/** 编辑对象任一字段变化时，按属性 diff 写回对应规则 */
watch(activeStyleConfig, (config) => {
  if (config && activeSelector.value) canvasStore.syncStyle(activeSelector.value, config);
}, { deep: true });

/** 规则被其他路径修改（撤销/重做、图层隐藏直写、代码应用）时重建编辑副本，避免陈旧副本把已撤销/被覆盖的样式写回 */
watch(() => canvasStore.styleRules, () => {
  if (!activeSelector.value) return;
  const fresh = canvasStore.getOrCreateStyleConfig(activeSelector.value);
  if (!isEqual(fresh, activeStyleConfig.value)) {
    activeStyleConfig.value = fresh;
  }
}, { deep: true });

/** 点击 class tag，切换编辑目标 */
function handleClassTagClick(cls: string) {
  if (activeClassName.value === cls) {
    canvasStore.activeClassName = null;
  } else {
    canvasStore.activeClassName = cls;
  }
}

/** 切换 class 的启用/禁用 */
function handleClassToggle(cls: string, enabled: boolean) {
  const el = selectedElement.value;
  if (!el) return;
  const item = el.classes.find((c) => c.name === cls);
  if (item) {
    item.enabled = enabled;
  }
}

/** 删除 class（从元素 classes 中移除） */
function handleClassRemove(cls: string) {
  const el = selectedElement.value;
  if (!el) return;
  const idx = el.classes.findIndex((c) => c.name === cls);
  if (idx !== -1) {
    el.classes.splice(idx, 1);
  }
  if (activeClassName.value === cls) {
    canvasStore.activeClassName = null;
  }
  /** 自动清理失效样式规则 */
  canvasStore.cleanupUnreferencedStyleRules();
}

/** 新增 class 名称输入值 */
const newClassName = ref('');

/** class 名称是否合法 */
const isClassNameValid = computed(() => CSS_NAME_REGEX.test(newClassName.value.trim()));

/** 行内新增 class */
function handleAddClass() {
  const cls = newClassName.value.trim();
  const el = selectedElement.value;
  if (!cls || !el || !isClassNameValid.value) return;
  /** 已存在则不重复添加 */
  if (!el.classes.some((c) => c.name === cls)) {
    el.classes.push({ name: cls, enabled: true });
    /** 同步创建 .cls 样式规则，保证该 class 出现在全局管理面板且可编辑 */
    canvasStore.getOrCreateStyleConfig(`.${cls}`);
  }
  newClassName.value = '';
}

/** 当切换选中元素时，重置 activeClassName */
watch(selectedElementId, () => {
  canvasStore.activeClassName = null;
}, {
  flush: 'sync'
});
</script>

<style scoped lang="less">
:deep(.ant-collapse) {
  border: none;
  background: transparent;
}

:deep(.ant-collapse-item) {
  border-bottom: 1px solid var(--editor-border);

  &:last-child {
    border-bottom: none;
  }
}

:deep(.ant-collapse-header) {
  padding: 8px 12px !important;
  align-items: center;
  transition: background 0.2s;

  &:hover {
    background: var(--editor-bg-item);
  }
}

:deep(.ant-collapse-header-text) {
  color: var(--editor-text);
  font-weight: 500;
  font-size: 13px;
}

:deep(.ant-collapse-expand-icon) {
  color: var(--editor-text-secondary);
  font-size: 12px;

  .anticon {
    transition: transform 0.2s;
  }
}

:deep(.ant-collapse-content) {
  background: transparent;
  border-top: 1px solid var(--editor-border);
}

:deep(.ant-collapse-content-box) {
  padding: 12px 12px 4px !important;
}

.style-panel {
  &-empty {
    color: var(--editor-text-tertiary);
    text-align: center;
    padding: 40px 16px;
    font-size: 13px;
  }

  &-classes {
    padding: 12px 12px 8px;
    border-bottom: 1px solid var(--editor-border);

    &-title {
      color: var(--editor-text-secondary);
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
      cursor: pointer;
      transition: opacity 0.2s;

      :deep(.me-tag__content) {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      &.is-active {
        background: var(--editor-accent-bg) !important;
        border-color: var(--editor-border-active) !important;
      }

      &.is-disabled {
        opacity: 0.5;

        .style-panel-classes-tag-name {
          text-decoration: line-through;
        }
      }

      &-toggle {
        display: inline-flex;
        align-items: center;
        color: var(--editor-text-secondary);
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
        margin-right: 2px;
        transition: color 0.2s;

        &:hover {
          color: var(--editor-text);
        }
      }

      &-name {
        display: inline-flex;
        align-items: center;
        color: var(--editor-text);
        font-size: 12px;
        line-height: 1;
        user-select: none;
      }
    }

    &-input-wrapper {
      margin-top: 6px;
    }

    &-error {
      margin-top: 4px;
      color: var(--app-color-error);
      font-size: 11px;
      line-height: 1.4;
    }
  }

  &-target {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--editor-border);

    &-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: var(--editor-radius-sm);
      font-size: 11px;
      font-weight: 500;

      &.is-element {
        color: var(--editor-text-secondary);
        background: var(--editor-bg-item);
      }

      &.is-class {
        color: var(--editor-accent-color, #1677ff);
        background: var(--editor-accent-bg);
      }
    }

    &-text {
      color: var(--editor-text);
      font-size: 12px;
      font-weight: 500;
    }

    &-switch {
      margin-left: auto;
      color: var(--editor-text-tertiary);
      font-size: 11px;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--editor-text);
      }
    }
  }
}
</style>
