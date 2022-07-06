import * as React from 'react';

export interface IHelloWorldProps {
  name?: string;
}

export class HelloWorld extends React.Component<IHelloWorldProps> {
  public render(): React.ReactNode {
    return (
      <div>
        {this.props.name}
      </div>
    )
  }
}