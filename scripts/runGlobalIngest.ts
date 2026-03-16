import { getGlobalReferenceQuote } from '@/lib/global/providers';

async function main() {
  const quote = await getGlobalReferenceQuote();
  console.log(JSON.stringify(quote, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
