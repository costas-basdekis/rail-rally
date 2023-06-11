// noinspection JSUnusedGlobalSymbols

import React from "react";
import type {Meta, StoryObj} from '@storybook/react';

import {Tile} from "@/components";

export default {
  title: 'Components/Tile',
  component: Tile,
} as Meta<typeof Tile>;

type Story = StoryObj<typeof Tile>;

const render = (props: Partial<Tile["props"]>) => {
  return (
    <svg width={50} height={50}>
      <Tile {...props} />
    </svg>
  )
};

export const Default: Story = {
  render,
  args: {
    tile: null,
  },
};
