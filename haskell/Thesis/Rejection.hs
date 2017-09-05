module Thesis.Rejection where
import System.Random
import Control.Monad.State
import Control.Monad.Trans.Maybe
import Data.Maybe
import Thesis.Random (uniform, bernoulli)

condition :: (RandomGen s) => Bool -> MaybeT (State s) ()
condition = MaybeT . return . toMaybe
  where toMaybe True  = Just ()
        toMaybe False = Nothing

sample = flip evalState
sampleMany m = catMaybes $ sample (mkStdGen 1) $ replicateM 10 $ runMaybeT m

dist1 = do
     b <- uniform 0 2
     condition $ b < 0.5
     return b

result1 = sampleMany dist1

-- built in does this
dist2 = do
     b <- uniform 0 2
     guard $ b < 0.5
     uniform 1 2
     
result2 = sampleMany dist2


