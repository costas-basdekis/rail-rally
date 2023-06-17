// noinspection JSUnusedGlobalSymbols

import React from "react";
import type {Meta, StoryObj} from '@storybook/react';

import {RGrid} from "@/components";
import {Grid} from "@/rails";

export default {
  title: 'Components/RGrid',
  component: RGrid,
} as Meta<typeof RGrid>;

type Story = StoryObj<typeof RGrid>;

const render = (props: Partial<RGrid["props"]>) => {
  return (
    <svg width={(props.grid?.width ?? 0) * 20 + 5} height={(props.grid?.height ?? 0) * 20 + 5}>
      <RGrid {...props} editable={false} />
    </svg>
  )
};

export const Empty: Story = {
  render,
  args: {
    grid: Grid.fromSize(3, 3),
  },
};

export const Arcs: Story = {
  render,
  args: {
    grid: Grid.fromSize(9,5)
      .connectMany([
        {x: 0, y: 2}, {x: 0, y: 1},
        {x: 1, y: 0}, {x: 2, y: 0},
        {x: 3, y: 1}, {x: 3, y: 2},
        {x: 2, y: 3}, {x: 1, y: 3},
      ], true)
      .connectMany([
        {x: 5, y: 2}, {x: 6, y: 1}, {x: 7, y: 2}, {x: 6, y: 3},
      ], true)
      .connect([{x: 4, y: 2}, {x: 5, y: 2}])
      .connect([{x: 6, y: 0}, {x: 6, y: 1}])
      .connect([{x: 8, y: 2}, {x: 7, y: 2}])
      .connect([{x: 6, y: 4}, {x: 6, y: 3}]),
  },
};

export const Straight: Story = {
  render,
  args: {
    grid: Grid.fromSize(5, 3)
      .connectMany([{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}])
      .connectMany([{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}])
      .connectMany([{x: 3, y: 0}, {x: 4, y: 1}])
      .connectMany([{x: 4, y: 0}, {x: 3, y: 1}]),
  },
};
