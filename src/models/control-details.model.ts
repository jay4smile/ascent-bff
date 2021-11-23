import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

// enum ControlType1 {
//   Preventative = "Preventative",
//   Detective = "Detective",
//   Corrective = "Corrective",
// }
// enum ControlType2 {
//   Administrative = "Administrative",
//   Technical = "Technical",
//   Physical = "Physical",
// }
// enum ControlType3 {
//   Automated = "Automated",
//   ManualImprobablyAutomated = "Manual, Improbably Automated",
//   ManualProspectivelyAutomated = "Manual, Prospectively Automated",
// }
// enum SCC {
//   Yes = "Y",
//   No = "N"
// }

interface Requirement {
  id: string;
  description?: string;
  risk_rating?: string;
  control_type_1?: string;
  control_type_2?: string;
  control_type_3?: string;
  ibm_public_cloud_scope?: string;
  ibm_public_cloud_resp?: string;
  developer_scope?: string;
  developer_resp?: string;
  operator_scope?: string;
  operator_resp?: string;
  consumer_scope?: string;
  consumer_resp?: string;
  scc?: string;
}

@model()
export class ControlDetails extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
  })
  focus_area?: string;

  @property({
    type: 'string',
    required: true,
  })
  family?: string;

  @property({
    type: 'string',
  })
  nist_functions?: string;

  @property({
    type: 'string',
  })
  risk_desc?: string;

  @property({
    type: 'string',
  })
  objective?: string;

  @property({
    type: 'string',
  })
  fs_guidance?: string;

  @property({
    type: 'string',
  })
  fs_params?: string;

  @property({
    type: 'string',
  })
  nist_guidance?: string;

  @property({
    type: 'string',
  })
  implementation?: string;

  @property({
    type: 'any',
  })
  requirements: Requirement[];

  constructor(data?: Partial<ControlDetails>) {
    super(data);
  }
}

export interface ControlDetailsRelations {
  // describe navigational properties here
}

export type ControlDetailsWithRelations = ControlDetails & ControlDetailsRelations;
