import { Class, Method, Module, Property, SectionBase, Text } from './generated.d.ts';

export type Section = SectionBase & (Module | Class | Method | Property | Text);
