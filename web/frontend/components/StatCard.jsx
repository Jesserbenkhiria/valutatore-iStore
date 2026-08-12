import {
  Card,
  DisplayText,
  SkeletonBodyText,
  SkeletonDisplayText,
  Stack,
  TextStyle,
} from "@shopify/polaris";

export function StatCard({ label, help, value, loading }) {
  return (
    <Card sectioned>
      <Stack vertical spacing="tight">
        <TextStyle variation="subdued">{label}</TextStyle>
        {loading ? (
          <>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={1} />
          </>
        ) : (
          <>
            <DisplayText size="medium">{value}</DisplayText>
            <TextStyle variation="subdued">{help}</TextStyle>
          </>
        )}
      </Stack>
    </Card>
  );
}
