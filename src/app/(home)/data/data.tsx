import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'

export const statuses = [
  {
    value: 'pending',
    label: 'Pending',
    icon: DotsHorizontalIcon,
  },
  {
    value: 'progress',
    label: 'In Progress',
    icon: StopwatchIcon,
  },
  {
    value: 'done',
    label: 'Done',
    icon: CheckCircledIcon,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CrossCircledIcon,
  },
]
