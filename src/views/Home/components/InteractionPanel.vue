<!-- ? 交互配置面板 -->
<template>
  <div class="interaction-panel">
    <div class="empty-tip" v-if="!selectedElementId">请选择一个元素</div>
    <template v-else>
      <div class="interaction-list">
        <div
          v-for="(rule, index) in selectedElement!.interactions"
          :key="index"
          class="interaction-rule"
        >
          <div class="interaction-rule-header">
            <span class="interaction-rule-title">规则 {{ index + 1 }}</span>
            <a-button
              type="text"
              size="small"
              danger
              @click="removeRule(index)"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>
          <div class="interaction-rule-body">
            <div class="interaction-rule-row">
              <span class="interaction-rule-label">事件</span>
              <a-select
                :value="rule.event"
                :options="INTERACTION_EVENT_OPTIONS"
                size="small"
                class="interaction-rule-select"
                @change="(val: InteractionEventEnum) => updateRule(index, 'event', val)"
              />
            </div>
            <div class="interaction-rule-row">
              <span class="interaction-rule-label">动作</span>
              <a-select
                :value="rule.action"
                :options="INTERACTION_ACTION_OPTIONS"
                size="small"
                class="interaction-rule-select"
                @change="(val: InteractionActionEnum) => updateRule(index, 'action', val)"
              />
            </div>
            <div
              v-if="rule.action !== InteractionActionEnum.NAVIGATE"
              class="interaction-rule-row"
            >
              <span class="interaction-rule-label">目标</span>
              <a-select
                :value="rule.targetId || '__self__'"
                :options="targetOptions"
                size="small"
                class="interaction-rule-select"
                @change="(val: string) => updateRule(index, 'targetId', val === '__self__' ? '' : val)"
              />
            </div>
            <div
              v-if="rule.action === InteractionActionEnum.TOGGLE_CLASS"
              class="interaction-rule-row"
            >
              <span class="interaction-rule-label">类名</span>
              <a-input
                :value="rule.params.className || ''"
                size="small"
                class="interaction-rule-input"
                placeholder="输入 CSS 类名"
                @change="(e: Event) => updateRuleParam(index, 'className', (e.target as HTMLInputElement).value)"
              />
            </div>
            <div
              v-if="rule.action === InteractionActionEnum.NAVIGATE"
              class="interaction-rule-row"
            >
              <span class="interaction-rule-label">URL</span>
              <a-input
                :value="rule.params.url || ''"
                size="small"
                class="interaction-rule-input"
                placeholder="输入跳转地址"
                @change="(e: Event) => updateRuleParam(index, 'url', (e.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="interaction-add">
        <a-button type="dashed" size="small" block @click="addRule">
          <template #icon><PlusOutlined /></template>
          添加交互规则
        </a-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import {
  InteractionEventEnum,
  InteractionActionEnum,
  INTERACTION_EVENT_OPTIONS,
  INTERACTION_ACTION_OPTIONS,
} from '@/constants/home';
import type { CanvasContainerElement, CanvasInnerElement, InteractionRule } from '../types';

defineOptions({
  name: 'InteractionPanel',
});

const canvasStore = useCanvasStore();
const { selectedElementId, root } = storeToRefs(canvasStore);

const selectedElement = computed(()=>{
  if(!selectedElementId.value){
    return null;
  }
  return canvasStore.getElementById(selectedElementId.value);
});

/** 目标元素选项（自身 + 其他所有元素） */
const targetOptions = computed(() => {
  const options: { label: string; value: string }[] = [
    { label: '当前元素', value: '__self__' },
  ];
  const collectIds = (elements: CanvasInnerElement[]) => {
    elements.forEach((el) => {
      if (el.id !== selectedElementId.value) {
        const typeLabel = el.alias;
        options.push({ label: `${typeLabel} (${el.id.slice(0, 6)})`, value: el.id });
      }
      if ('children' in el) {
        collectIds((el as CanvasContainerElement).children);
      }
    });
  };
  collectIds(root.value.children);
  return options;
});

/** 创建默认规则 */
function createDefaultRule(): InteractionRule {
  return {
    event: InteractionEventEnum.CLICK,
    action: InteractionActionEnum.TOGGLE_VISIBILITY,
    targetId: '',
    params: {},
  };
}

/** 添加规则 */
function addRule() {
  if (!selectedElement.value) return;
  selectedElement.value.interactions.push(createDefaultRule());
}

/** 删除规则 */
function removeRule(index: number) {
  if (!selectedElement.value) return;
  selectedElement.value.interactions.splice(index, 1);
}

/** 更新规则字段 */
function updateRule(index: number, key: keyof InteractionRule, value: any) {
  if (!selectedElement.value) return;
  (selectedElement.value.interactions[index] as any)[key] = value;
}

/** 更新规则参数 */
function updateRuleParam(index: number, key: string, value: string) {
  if (!selectedElement.value) return;
  selectedElement.value.interactions[index].params[key] = value;
}
</script>

<style scoped lang="less">
.interaction-panel {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.empty-tip {
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
}

.interaction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.interaction-rule {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.interaction-rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.interaction-rule-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}

.interaction-rule-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.interaction-rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interaction-rule-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  min-width: 28px;
  flex-shrink: 0;
}

.interaction-rule-select {
  flex: 1;
  min-width: 0;
}

.interaction-rule-input {
  flex: 1;
  min-width: 0;
}

.interaction-add {
  margin-top: 12px;
}

:deep(.ant-btn-dangerous) {
  color: #ff4d4f;
}

:deep(.ant-select-selector) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #fff !important;
}

:deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.45);
}

:deep(.ant-input) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

:deep(.ant-btn-dashed) {
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.15);

  &:hover {
    color: rgba(255, 255, 255, 0.75);
    border-color: rgba(255, 255, 255, 0.3);
  }
}
</style>
